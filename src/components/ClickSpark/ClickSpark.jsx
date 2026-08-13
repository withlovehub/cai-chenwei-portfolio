import { useCallback, useEffect, useRef } from 'react'
import './ClickSpark.css'

export default function ClickSpark({
  children,
  sparkColor = '#67e7ff',
  sparkCount = 10,
  sparkRadius = 34,
  sparkSize = 12,
  duration = 520,
}) {
  const canvasRef = useRef(null)
  const sparksRef = useRef([])
  const burstsRef = useRef(0)
  const frameRef = useRef(0)
  const canAnimateRef = useRef(false)
  const pageVisibleRef = useRef(true)
  const scheduleFrameRef = useRef(() => {})

  const easeOut = useCallback((value) => value * (2 - value), [])
  const handleClick = useCallback((event) => {
    if (!canAnimateRef.current) return

    const now = performance.now()
    burstsRef.current += 1
    if (canvasRef.current) canvasRef.current.dataset.sparkBursts = String(burstsRef.current)
    sparksRef.current.push(...Array.from({ length: sparkCount }, (_, index) => ({
      x: event.clientX,
      y: event.clientY,
      angle: (Math.PI * 2 * index) / sparkCount,
      start: now,
    })))
    scheduleFrameRef.current()
  }, [sparkCount])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let hiddenAt = null

    const stopFrame = () => {
      if (!frameRef.current) return
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time) => {
      frameRef.current = 0
      if (disposed || !canAnimateRef.current || !pageVisibleRef.current) return

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      sparksRef.current = sparksRef.current.filter((spark) => {
        const progress = (time - spark.start) / duration
        if (progress >= 1) return false
        const eased = easeOut(Math.max(progress, 0))
        const distance = eased * sparkRadius
        const line = sparkSize * (1 - eased)
        const x1 = spark.x + Math.cos(spark.angle) * distance
        const y1 = spark.y + Math.sin(spark.angle) * distance
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x1 + Math.cos(spark.angle) * line, y1 + Math.sin(spark.angle) * line)
        context.strokeStyle = sparkColor
        context.globalAlpha = 1 - eased
        context.lineWidth = 1.4
        context.stroke()
        return true
      })
      canvas.dataset.activeSparks = String(sparksRef.current.length)
      context.globalAlpha = 1
      if (sparksRef.current.length > 0) {
        frameRef.current = requestAnimationFrame(draw)
      }
    }

    const scheduleFrame = () => {
      if (
        disposed
        || frameRef.current
        || sparksRef.current.length === 0
        || !canAnimateRef.current
        || !pageVisibleRef.current
      ) return

      frameRef.current = requestAnimationFrame(draw)
    }

    const handleVisibilityChange = () => {
      pageVisibleRef.current = !document.hidden
      if (document.hidden) {
        hiddenAt = performance.now()
        stopFrame()
        return
      }

      if (hiddenAt !== null) {
        const hiddenDuration = performance.now() - hiddenAt
        sparksRef.current.forEach((spark) => {
          spark.start += hiddenDuration
        })
        hiddenAt = null
      }
      scheduleFrame()
    }

    const handleMotionPreferenceChange = (event) => {
      canAnimateRef.current = !event.matches
      if (!canAnimateRef.current) {
        sparksRef.current = []
        canvas.dataset.activeSparks = '0'
        context.clearRect(0, 0, window.innerWidth, window.innerHeight)
        stopFrame()
        return
      }
      scheduleFrame()
    }

    canAnimateRef.current = !motionQuery.matches
    pageVisibleRef.current = !document.hidden
    scheduleFrameRef.current = scheduleFrame
    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionQuery.addEventListener('change', handleMotionPreferenceChange)
    canvas.dataset.activeSparks = String(sparksRef.current.length)
    scheduleFrame()

    return () => {
      disposed = true
      stopFrame()
      canAnimateRef.current = false
      scheduleFrameRef.current = () => {}
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [duration, easeOut, sparkColor, sparkRadius, sparkSize])

  return (
    <div className="click-spark-root" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />
      {children}
    </div>
  )
}
