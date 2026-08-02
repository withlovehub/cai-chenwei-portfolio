import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import './DecryptedText.css'

const splitGraphemes = (text) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(text)].map(({ segment }) => segment)
  }
  return Array.from(text)
}

export default function DecryptedText({
  text,
  speed = 42,
  sequential = true,
  revealDirection = 'start',
  animateOn = 'view',
  characters = '01<>[]{}#%&/ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  className = '',
  encryptedClassName = '',
  parentClassName = '',
}) {
  const source = useMemo(() => splitGraphemes(text), [text])
  const encrypted = useMemo(() => splitGraphemes(characters), [characters])
  const [display, setDisplay] = useState(source)
  const [revealed, setRevealed] = useState(new Set())
  const [animating, setAnimating] = useState(false)
  const ref = useRef(null)
  const timerRef = useRef(null)
  const reduceMotion = useReducedMotion()

  const order = useMemo(() => {
    if (revealDirection === 'end') return source.map((_, index) => source.length - index - 1)
    if (revealDirection === 'center') {
      const middle = Math.floor(source.length / 2)
      return source.map((_, index) => {
        if (index === 0) return middle
        const offset = Math.ceil(index / 2)
        return index % 2 ? middle - offset : middle + offset
      }).filter((index) => index >= 0 && index < source.length)
    }
    return source.map((_, index) => index)
  }, [revealDirection, source])

  const scramble = useCallback((visible) => source.map((character, index) => {
    if (/\s/.test(character) || visible.has(index)) return character
    return encrypted[Math.floor(Math.random() * encrypted.length)] || character
  }), [encrypted, source])

  const start = useCallback(() => {
    if (reduceMotion || animating) return
    window.clearInterval(timerRef.current)
    const visible = new Set()
    let pointer = 0
    let iteration = 0
    setRevealed(new Set())
    setDisplay(scramble(visible))
    setAnimating(true)

    timerRef.current = window.setInterval(() => {
      iteration += 1
      if (sequential && pointer < order.length) {
        visible.add(order[pointer])
        pointer += 1
      } else if (!sequential) {
        const amount = Math.ceil((iteration / 12) * source.length)
        order.slice(0, amount).forEach((index) => visible.add(index))
      }
      setRevealed(new Set(visible))
      setDisplay(scramble(visible))
      if (visible.size >= source.length || (!sequential && iteration >= 12)) {
        window.clearInterval(timerRef.current)
        setDisplay(source)
        setRevealed(new Set(source.map((_, index) => index)))
        setAnimating(false)
      }
    }, speed)
  }, [animating, order, reduceMotion, scramble, sequential, source, speed])

  useEffect(() => {
    setDisplay(source)
    if (reduceMotion || animateOn === 'hover') return undefined
    const element = ref.current
    if (!element) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start()
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [animateOn, reduceMotion, source, start])

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  return (
    <span
      className={`rb-decrypted ${parentClassName}`.trim()}
      ref={ref}
      onMouseEnter={animateOn === 'hover' ? start : undefined}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {display.map((character, index) => (
          <span className={revealed.has(index) || !animating ? className : encryptedClassName} key={`${index}-${character}`}>
            {character}
          </span>
        ))}
      </span>
    </span>
  )
}
