import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollFloat.css'

gsap.registerPlugin(ScrollTrigger)

const splitGraphemes = (text) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(text)].map(({ segment }) => segment)
  }
  return Array.from(text)
}

export default function ScrollFloat({
  children,
  as: Tag = 'div',
  className = '',
  textClassName = '',
  stagger = 0.025,
}) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const characters = useMemo(() => splitGraphemes(String(children || '')), [children])

  useEffect(() => {
    const element = ref.current
    if (!element || reduceMotion) return undefined
    const context = gsap.context(() => {
      gsap.fromTo(
        element.querySelectorAll('.rb-scroll-float__char'),
        { opacity: 0, yPercent: 115, scaleY: 2, scaleX: 0.72, rotate: 3, transformOrigin: '50% 0%' },
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          rotate: 0,
          ease: 'back.out(1.8)',
          stagger,
          scrollTrigger: { trigger: element, start: 'top 88%', end: 'bottom 52%', scrub: 0.7 },
        },
      )
    }, element)
    return () => context.revert()
  }, [characters, reduceMotion, stagger])

  return (
    <Tag ref={ref} className={`rb-scroll-float ${className}`.trim()} aria-label={String(children || '')}>
      <span className={`rb-scroll-float__text ${textClassName}`.trim()} aria-hidden="true">
        {characters.map((character, index) => (
          character === '\n'
            ? <br key={`break-${index}`} />
            : <span className="rb-scroll-float__char" key={`${character}-${index}`}>{character === ' ' ? '\u00A0' : character}</span>
        ))}
      </span>
    </Tag>
  )
}
