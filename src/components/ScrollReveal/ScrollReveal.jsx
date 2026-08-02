import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollReveal.css'

gsap.registerPlugin(ScrollTrigger)

const segmentText = (text) => {
  if (!text) return []
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
}) => {
  const containerRef = useRef(null)
  const segments = useMemo(() => segmentText(typeof children === 'string' ? children : ''), [children])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const scroller = scrollContainerRef?.current || window
    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: { trigger: element, scroller, start: 'top bottom', end: rotationEnd, scrub: true },
        },
      )

      const words = element.querySelectorAll('.scroll-reveal__word')
      gsap.fromTo(
        words,
        { opacity: baseOpacity, willChange: 'opacity, filter' },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: { trigger: element, scroller, start: 'top bottom-=12%', end: wordAnimationEnd, scrub: true },
        },
      )

      if (enableBlur) {
        gsap.fromTo(
          words,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: { trigger: element, scroller, start: 'top bottom-=12%', end: wordAnimationEnd, scrub: true },
          },
        )
      }
    }, element)

    ScrollTrigger.refresh()
    return () => context.revert()
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength])

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal__text ${textClassName}`}>
        {segments.map((segment, index) =>
          /^\s+$/.test(segment) ? segment : (
            <span className="scroll-reveal__word" key={`${segment}-${index}`}>
              {segment}
            </span>
          ),
        )}
      </p>
    </div>
  )
}

export default ScrollReveal
