import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import './MaskedHeading.css'

const clamp = (value, min, max) => (value < min ? min : value > max ? max : value)

export default function MaskedHeading({
  text = 'Designed in the details',
  tag = 'h2',
  mediaType = 'image',
  src = '',
  poster = '',
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = 'rise',
  duration = 1.1,
  stagger = 0.09,
  trigger = 'view',
  align = 'center',
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className = '',
  style,
  ...rest
}) {
  const rootRef = useRef(null)
  const measureRef = useRef(null)
  const revealRef = useRef(null)
  const mediaRef = useRef(null)
  const wordRefs = useRef([])
  const baseRefs = useRef([])
  const glyphRefs = useRef([])
  const tweenRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const words = useMemo(() => String(text).split(/\s+/).filter(Boolean), [text])
  const settingsRef = useRef({})

  settingsRef.current = { fillScale, parallax, drift, brightness, saturation, grayscale, textScale }

  const place = useCallback(() => {
    const root = rootRef.current
    const media = mediaRef.current
    if (!root || !media) return

    const settings = settingsRef.current
    const offset = offsetRef.current
    const maxX = Math.max(0, ((settings.fillScale - 1) / 2) * root.clientWidth)
    const maxY = Math.max(0, ((settings.fillScale - 1) / 2) * root.clientHeight)

    media.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${settings.fillScale})`
    media.style.filter = `brightness(${settings.brightness}) saturate(${settings.saturation})${settings.grayscale ? ' grayscale(1)' : ''}`
  }, [])

  const sync = useCallback(() => {
    const root = rootRef.current
    const measure = measureRef.current
    if (!root || !measure) return

    root.style.fontSize = `${clamp(root.clientWidth * settingsRef.current.textScale, 20, 200).toFixed(1)}px`
    const computed = window.getComputedStyle(measure)

    wordRefs.current.forEach((box, index) => {
      const base = baseRefs.current[index]
      const glyph = glyphRefs.current[index]
      if (!box || !base || !glyph) return
      glyph.setAttribute('x', `${box.offsetLeft}`)
      glyph.setAttribute('y', `${base.offsetTop}`)
      glyph.style.fontFamily = computed.fontFamily
      glyph.style.fontSize = computed.fontSize
      glyph.style.fontWeight = computed.fontWeight
      glyph.style.fontStyle = computed.fontStyle
      glyph.style.letterSpacing = computed.letterSpacing
    })
    place()
  }, [place])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    sync()
    const resizeObserver = new ResizeObserver(sync)
    resizeObserver.observe(root)
    document.fonts?.ready?.then(sync).catch(() => {})

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId = 0
    let inView = true
    let last = performance.now()
    let clock = 0

    const frame = (now) => {
      frameId = 0
      if (document.hidden || !inView) return
      const delta = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += delta
      const settings = settingsRef.current
      const offset = offsetRef.current
      const driftX = Math.sin(clock * 0.21) * settings.drift
      const driftY = Math.cos(clock * 0.17) * settings.drift * 0.6
      const ease = 1 - Math.exp(-delta / 0.18)

      offset.x += (offset.tx + driftX - offset.x) * ease
      offset.y += (offset.ty + driftY - offset.y) * ease
      place()
      frameId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (reduceMotion || frameId || document.hidden || !inView) return
      last = performance.now()
      frameId = requestAnimationFrame(frame)
    }

    const stop = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
    }

    const onMove = (event) => {
      const settings = settingsRef.current
      if (settings.parallax <= 0) return
      const bounds = root.getBoundingClientRect()
      const normalizedX = ((event.clientX - bounds.left) / (bounds.width || 1)) * 2 - 1
      const normalizedY = ((event.clientY - bounds.top) / (bounds.height || 1)) * 2 - 1
      offsetRef.current.tx = clamp(normalizedX, -1, 1) * -settings.parallax
      offsetRef.current.ty = clamp(normalizedY, -1, 1) * -settings.parallax
    }

    const onLeave = () => {
      offsetRef.current.tx = 0
      offsetRef.current.ty = 0
    }

    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) start()
      else stop()
    }, { rootMargin: '80px' })
    intersectionObserver.observe(root)

    if (!reduceMotion) {
      root.addEventListener('pointermove', onMove, { passive: true })
      root.addEventListener('pointerleave', onLeave)
      document.addEventListener('visibilitychange', onVisibilityChange)
      start()
    } else {
      place()
    }

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [place, sync])

  useEffect(() => {
    sync()
  }, [sync, words, tag, align, weight, tracking, lineHeight, textScale])

  useEffect(() => {
    const root = rootRef.current
    const layer = revealRef.current
    if (!root || !layer) return undefined
    const glyphs = glyphRefs.current.filter(Boolean)
    if (!glyphs.length) return undefined

    const riseDistance = () => (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15
    const settle = () => {
      gsap.set(glyphs, { y: 0 })
      gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' })
    }
    const rest = () => {
      if (reveal === 'rise') gsap.set(glyphs, { y: riseDistance() })
      if (reveal === 'wipe') gsap.set(layer, { clipPath: 'inset(0% 100% 0% 0%)' })
      if (reveal === 'fade') gsap.set(layer, { opacity: 0, scale: 1.08 })
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reveal === 'none' || reduceMotion) {
      settle()
      return undefined
    }

    const play = () => {
      tweenRef.current?.kill()
      if (reveal === 'rise') {
        gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        tweenRef.current = gsap.fromTo(glyphs, { y: riseDistance() }, {
          y: 0,
          duration,
          stagger,
          ease: 'power4.out',
          overwrite: 'auto',
        })
      } else if (reveal === 'wipe') {
        gsap.set(glyphs, { y: 0 })
        const state = { progress: 100 }
        tweenRef.current = gsap.to(state, {
          progress: 0,
          duration,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onUpdate: () => {
            layer.style.clipPath = `inset(0% ${state.progress}% 0% 0%)`
          },
        })
      } else {
        gsap.set(glyphs, { y: 0 })
        tweenRef.current = gsap.fromTo(layer, { opacity: 0, scale: 1.08 }, {
          opacity: 1,
          scale: 1,
          duration,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    }

    if (trigger === 'hover') {
      settle()
      root.addEventListener('pointerenter', play)
      return () => {
        root.removeEventListener('pointerenter', play)
        tweenRef.current?.kill()
      }
    }

    if (trigger === 'view') {
      settle()
      rest()
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play()
          observer.disconnect()
        }
      }, { threshold: 0.25 })
      observer.observe(root)
      return () => {
        observer.disconnect()
        tweenRef.current?.kill()
      }
    }

    play()
    return () => tweenRef.current?.kill()
  }, [reveal, trigger, duration, stagger, words])

  const Tag = tag

  return (
    <Tag
      ref={rootRef}
      className={`masked-heading ${className}`.trim()}
      style={{ textAlign: align, fontWeight: weight, letterSpacing: `${tracking}em`, lineHeight, ...style }}
      {...rest}
    >
      <span ref={measureRef} className="masked-heading__measure">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            ref={(element) => { wordRefs.current[index] = element }}
            className="masked-heading__word"
          >
            {word}
            <i ref={(element) => { baseRefs.current[index] = element }} className="masked-heading__baseline" />
          </span>
        ))}
      </span>

      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, index) => (
              <text key={`${word}-${index}`} ref={(element) => { glyphRefs.current[index] = element }}>
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revealRef} className="masked-heading__reveal">
        <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
          <span ref={mediaRef} className="masked-heading__media">
            {mediaType === 'video' ? (
              <video className="masked-heading__source" src={src} poster={poster} autoPlay muted loop playsInline />
            ) : (
              <img className="masked-heading__source" src={src} alt="" draggable={false} />
            )}
          </span>
        </span>
      </span>
    </Tag>
  )
}
