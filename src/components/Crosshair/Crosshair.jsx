import { useEffect, useId, useRef } from 'react'
import { gsap } from 'gsap'

const lerp = (a, b, amount) => (1 - amount) * a + amount * b

const getMousePosition = (event, container) => {
  if (!container) return { x: event.clientX, y: event.clientY }
  const bounds = container.getBoundingClientRect()
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
}

const Crosshair = ({ color = 'white', containerRef = null }) => {
  const lineHorizontalRef = useRef(null)
  const lineVerticalRef = useRef(null)
  const filterXRef = useRef(null)
  const filterYRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const filterXId = `crosshair-noise-x-${id}`
  const filterYId = `crosshair-noise-y-${id}`

  useEffect(() => {
    const container = containerRef?.current
    const target = container || window
    const horizontal = lineHorizontalRef.current
    const vertical = lineVerticalRef.current
    if (!horizontal || !vertical || window.matchMedia('(hover: none)').matches) return undefined

    const rendered = {
      x: { previous: 0, current: 0, amount: 0.15 },
      y: { previous: 0, current: 0, amount: 0.15 },
    }
    const turbulence = { value: 0 }
    let raf = 0
    let hasStarted = false

    gsap.set([horizontal, vertical], { opacity: 0 })

    const distortion = gsap.timeline({
      paused: true,
      onStart: () => {
        horizontal.style.filter = `url(#${filterXId})`
        vertical.style.filter = `url(#${filterYId})`
      },
      onUpdate: () => {
        filterXRef.current?.setAttribute('baseFrequency', turbulence.value)
        filterYRef.current?.setAttribute('baseFrequency', turbulence.value)
      },
      onComplete: () => {
        horizontal.style.filter = 'none'
        vertical.style.filter = 'none'
      },
    }).to(turbulence, { duration: 0.5, ease: 'power1.out', startAt: { value: 1 }, value: 0 })

    const render = () => {
      rendered.x.current = mouseRef.current.x
      rendered.y.current = mouseRef.current.y
      rendered.x.previous = lerp(rendered.x.previous, rendered.x.current, rendered.x.amount)
      rendered.y.previous = lerp(rendered.y.previous, rendered.y.current, rendered.y.amount)
      gsap.set(vertical, { x: rendered.x.previous })
      gsap.set(horizontal, { y: rendered.y.previous })
      raf = requestAnimationFrame(render)
    }

    const handleMouseMove = (event) => {
      mouseRef.current = getMousePosition(event, container)
      if (!hasStarted) {
        rendered.x.previous = rendered.x.current = mouseRef.current.x
        rendered.y.previous = rendered.y.current = mouseRef.current.y
        hasStarted = true
        render()
      }
      gsap.to([horizontal, vertical], { duration: 0.45, ease: 'power3.out', opacity: 0.38 })
    }

    const hide = () => gsap.to([horizontal, vertical], { duration: 0.3, opacity: 0 })
    const enterLink = () => distortion.restart()
    const leaveLink = () => distortion.progress(1).pause()
    const links = container ? container.querySelectorAll('a') : document.querySelectorAll('a')

    target.addEventListener('mousemove', handleMouseMove)
    if (container) container.addEventListener('mouseleave', hide)
    links.forEach((link) => {
      link.addEventListener('mouseenter', enterLink)
      link.addEventListener('mouseleave', leaveLink)
    })

    return () => {
      cancelAnimationFrame(raf)
      target.removeEventListener('mousemove', handleMouseMove)
      if (container) container.removeEventListener('mouseleave', hide)
      links.forEach((link) => {
        link.removeEventListener('mouseenter', enterLink)
        link.removeEventListener('mouseleave', leaveLink)
      })
      distortion.kill()
      gsap.killTweensOf([horizontal, vertical])
    }
  }, [containerRef, filterXId, filterYId])

  return (
    <div
      className="rb-crosshair"
      aria-hidden="true"
      style={{
        position: containerRef ? 'absolute' : 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 8,
        overflow: 'hidden',
      }}
    >
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id={filterXId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterXRef} />
            <feDisplacementMap in="SourceGraphic" scale="28" />
          </filter>
          <filter id={filterYId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterYRef} />
            <feDisplacementMap in="SourceGraphic" scale="28" />
          </filter>
        </defs>
      </svg>
      <div
        ref={lineHorizontalRef}
        style={{ position: 'absolute', width: '100%', height: 1, background: color, transform: 'translateY(50%)', opacity: 0 }}
      />
      <div
        ref={lineVerticalRef}
        style={{ position: 'absolute', width: 1, height: '100%', background: color, transform: 'translateX(50%)', opacity: 0 }}
      />
    </div>
  )
}

export default Crosshair
