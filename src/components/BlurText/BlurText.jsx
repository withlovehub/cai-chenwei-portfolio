import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './BlurText.css'

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])
  const keyframes = {}

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])]
  })

  return keyframes
}

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current) return undefined
    if (reduceMotion) {
      setInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, rootMargin, reduceMotion])

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -42 }
        : { filter: 'blur(10px)', opacity: 0, y: 42 },
    [direction],
  )

  const defaultTo = useMemo(
    () => [
      { filter: 'blur(4px)', opacity: 0.55, y: direction === 'top' ? 4 : -4 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  )

  const fromSnapshot = reduceMotion ? { filter: 'blur(0px)', opacity: 1, y: 0 } : (animationFrom ?? defaultFrom)
  const toSnapshots = reduceMotion ? [{ filter: 'blur(0px)', opacity: 1, y: 0 }] : (animationTo ?? defaultTo)
  const stepCount = toSnapshots.length + 1
  const totalDuration = reduceMotion ? 0 : stepDuration * (stepCount - 1)
  const times = Array.from({ length: stepCount }, (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1)))
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots)

  return (
    <span ref={ref} className={`blur-text ${className}`} aria-label={text}>
      {elements.map((segment, index) => (
        <motion.span
          className="blur-text__segment"
          key={`${segment}-${index}`}
          aria-hidden="true"
          initial={fromSnapshot}
          animate={inView ? animateKeyframes : fromSnapshot}
          transition={{
            duration: totalDuration,
            times,
            delay: reduceMotion ? 0 : (index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </span>
  )
}

export default BlurText
