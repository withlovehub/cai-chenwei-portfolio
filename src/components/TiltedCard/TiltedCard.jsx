import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import './TiltedCard.css'

const spring = { damping: 24, stiffness: 150, mass: 0.8 }

export default function TiltedCard({ children, className = '', rotateAmplitude = 7, scaleOnHover = 1.015 }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const rotateX = useSpring(useMotionValue(0), spring)
  const rotateY = useSpring(useMotionValue(0), spring)
  const scale = useSpring(1, spring)

  const onMove = (event) => {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
    if (!inside) {
      rotateX.set(0)
      rotateY.set(0)
      scale.set(1)
      return
    }
    rotateX.set(((event.clientY - rect.top) / rect.height - 0.5) * -rotateAmplitude * 2)
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * rotateAmplitude * 2)
    scale.set(scaleOnHover)
  }

  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
  }

  useEffect(() => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return undefined
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduceMotion, rotateAmplitude, rotateX, rotateY, scale, scaleOnHover])

  return (
    <div className={`rb-tilted-card ${className}`.trim()} ref={ref} onMouseLeave={onLeave}>
      <motion.div className="rb-tilted-card__inner" style={{ rotateX, rotateY, scale }}>
        {children}
      </motion.div>
    </div>
  )
}
