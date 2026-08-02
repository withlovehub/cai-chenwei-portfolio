import { Children, cloneElement, useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollStack.css'

gsap.registerPlugin(ScrollTrigger)

export function ScrollStackItem({ children, className = '', index = 0, ...props }) {
  return (
    <article className={`rb-scroll-stack__card ${className}`.trim()} style={{ '--stack-index': index }} {...props}>
      {children}
    </article>
  )
}

export default function ScrollStack({ children, className = '' }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || reduceMotion) return undefined
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.rb-scroll-stack__card', element)
      gsap.fromTo(cards, {
        y: 22,
        opacity: 0.5,
        scale: 0.995,
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      })
    }, element)
    return () => context.revert()
  }, [reduceMotion])

  return (
    <div className={`rb-scroll-stack ${className}`.trim()} ref={ref}>
      {Children.map(children, (child, index) => cloneElement(child, {
        className: `rb-scroll-stack__card ${child.props.className || ''}`.trim(),
        style: { ...child.props.style, '--stack-index': index },
      }))}
    </div>
  )
}
