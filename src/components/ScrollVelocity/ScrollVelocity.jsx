import { useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import './ScrollVelocity.css'

const wrap = (min, max, value) => {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

function VelocityLine({ children, baseVelocity, copies, className }) {
  const copyRef = useRef(null)
  const baseX = useMotionValue(0)
  const [copyWidth, setCopyWidth] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 380 })
  const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false })

  useLayoutEffect(() => {
    const element = copyRef.current
    if (!element) return undefined
    const update = () => setCopyWidth(element.offsetWidth)
    const observer = new ResizeObserver(update)
    observer.observe(element)
    update()
    return () => observer.disconnect()
  }, [children])

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !copyWidth) return
    const direction = velocityFactor.get() < 0 ? -1 : 1
    const move = direction * baseVelocity * (delta / 1000) * (1 + Math.abs(velocityFactor.get()))
    baseX.set(baseX.get() + move)
  })

  const x = useTransform(baseX, (value) => (copyWidth ? `${wrap(-copyWidth, 0, value)}px` : '0px'))

  return (
    <div className="rb-velocity-parallax">
      <motion.div className="rb-velocity-scroller" style={{ x: reduceMotion ? 0 : x }}>
        {Array.from({ length: copies }, (_, index) => (
          <span className={className} key={index} ref={index === 0 ? copyRef : null}>
            {children}<i>✦</i>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function ScrollVelocity({ texts = [], velocity = 70, copies = 5, className = '' }) {
  return (
    <section className="rb-velocity" aria-label="滚动主题标签">
      {texts.map((text, index) => (
        <VelocityLine
          baseVelocity={index % 2 ? -velocity : velocity}
          copies={copies}
          className={className}
          key={text}
        >
          {text}
        </VelocityLine>
      ))}
    </section>
  )
}
