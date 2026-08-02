import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import './Magnet.css'

export default function Magnet({ children, className = '', padding = 90, strength = 3.2 }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.5 })

  useEffect(() => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return undefined
    const onMove = (event) => {
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      if (Math.abs(event.clientX - centerX) < rect.width / 2 + padding && Math.abs(event.clientY - centerY) < rect.height / 2 + padding) {
        rawX.set((event.clientX - centerX) / strength)
        rawY.set((event.clientY - centerY) / strength)
      } else {
        rawX.set(0)
        rawY.set(0)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [padding, rawX, rawY, reduceMotion, strength])

  return (
    <span className={`rb-magnet ${className}`.trim()} ref={ref}>
      <motion.span className="rb-magnet__inner" style={{ x, y }}>{children}</motion.span>
    </span>
  )
}
