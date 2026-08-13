import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './LiquidChrome.css'

const DEFAULT_COLOR = [0.34, 0.42, 0.44]
const DEFAULT_MAX_DPR = 1.25
const DEFAULT_MAX_FPS = 30

const clampColor = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : fallback
}

export const LiquidChrome = ({
  baseColor = DEFAULT_COLOR,
  speed = 0.12,
  amplitude = 0.1,
  frequencyX = 1.35,
  frequencyY = 1.75,
  interactive = true,
  maxDpr = DEFAULT_MAX_DPR,
  maxFps = DEFAULT_MAX_FPS,
  className = '',
  ...props
}) => {
  const containerRef = useRef(null)
  const colorR = clampColor(baseColor?.[0], DEFAULT_COLOR[0])
  const colorG = clampColor(baseColor?.[1], DEFAULT_COLOR[1])
  const colorB = clampColor(baseColor?.[2], DEFAULT_COLOR[2])
  const dprLimit = Number.isFinite(Number(maxDpr))
    ? Math.min(2, Math.max(0.5, Number(maxDpr)))
    : DEFAULT_MAX_DPR
  const fpsLimit = Number.isFinite(Number(maxFps))
    ? Math.min(120, Math.max(1, Number(maxFps)))
    : DEFAULT_MAX_FPS

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let prefersReducedMotion = reducedMotionQuery.matches
    let isVisible = true
    let animationId = 0
    let disposed = false
    let lastFrameTime = 0
    let cachedBounds = null
    let boundsDirty = true
    const frameInterval = 1000 / fpsLimit

    let renderer
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, dprLimit),
        powerPreference: 'high-performance',
      })
    } catch {
      container.dataset.fallback = 'true'
      return undefined
    }
    const gl = renderer.gl
    delete container.dataset.fallback
    gl.clearColor(0, 0, 0, 0)
    gl.canvas.setAttribute('aria-hidden', 'true')

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;

      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform float uInteractive;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
        vec2 centered = vUv * 2.0 - 1.0;
        centered.x *= uResolution.x / max(uResolution.y, 1.0);
        vec2 liquid = centered;

        for (float i = 1.0; i <= 5.0; i++) {
          float phase = uTime * (0.72 + i * 0.025);
          liquid.x += (uAmplitude / i) * cos(liquid.y * uFrequencyX * i + phase + uMouse.x * 0.45);
          liquid.y += (uAmplitude / i) * sin(liquid.x * uFrequencyY * i - phase + uMouse.y * 0.36);
        }

        vec2 pointerDelta = vUv - uMouse;
        float pointerGlow = (1.0 - smoothstep(0.0, 0.58, length(pointerDelta))) * uInteractive;
        float broadWave = 0.5 + 0.5 * sin(liquid.x * 1.18 - liquid.y * 0.82 + uTime * 0.32);
        float crossWave = 0.5 + 0.5 * cos(liquid.y * 1.42 + liquid.x * 0.52 - uTime * 0.24);
        float field = mix(broadWave, crossWave, 0.42);
        float softSheen = smoothstep(0.56, 0.94, field);
        float deepFold = smoothstep(0.13, 0.48, field);

        vec3 shadow = uBaseColor * 0.19 + vec3(0.012, 0.018, 0.02);
        vec3 body = uBaseColor * (0.36 + deepFold * 0.32);
        vec3 silver = vec3(0.64, 0.72, 0.73);
        vec3 color = mix(shadow, body, smoothstep(0.06, 0.9, field));
        color = mix(color, silver, softSheen * 0.24);
        color += vec3(0.11, 0.22, 0.23) * pointerGlow * 0.18;

        float vignette = 1.0 - smoothstep(0.18, 1.48, length(centered * vec2(0.72, 0.9)));
        color *= mix(0.73, 1.03, vignette);

        gl_FragColor = vec4(color, 1.0);
      }
    `

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Float32Array([1, 1, 1]) },
        uBaseColor: { value: new Float32Array([colorR, colorG, colorB]) },
        uAmplitude: { value: Math.max(0, amplitude) },
        uFrequencyX: { value: Math.max(0.01, frequencyX) },
        uFrequencyY: { value: Math.max(0.01, frequencyY) },
        uInteractive: { value: interactive ? 1 : 0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })
    const mouseTarget = { x: 0.5, y: 0.5 }

    const refreshBounds = () => {
      cachedBounds = container.getBoundingClientRect()
      boundsDirty = false
      return cachedBounds
    }

    const markBoundsDirty = () => {
      boundsDirty = true
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      renderer.setSize(width, height)
      refreshBounds()
      const resolution = program.uniforms.uResolution.value
      resolution[0] = gl.canvas.width
      resolution[1] = gl.canvas.height
      resolution[2] = gl.canvas.width / Math.max(gl.canvas.height, 1)
    }

    const render = (time = 0) => {
      const mouse = program.uniforms.uMouse.value
      mouse[0] += (mouseTarget.x - mouse[0]) * 0.045
      mouse[1] += (mouseTarget.y - mouse[1]) * 0.045
      program.uniforms.uTime.value = time * 0.001 * Math.max(0, speed)
      renderer.render({ scene: mesh })
    }

    const stop = () => {
      if (animationId) cancelAnimationFrame(animationId)
      animationId = 0
    }

    const update = (time) => {
      animationId = 0
      if (disposed || document.hidden || !isVisible || prefersReducedMotion) return
      const elapsed = time - lastFrameTime
      if (!lastFrameTime || elapsed >= frameInterval - 1) {
        render(time)
        lastFrameTime = time - (elapsed % frameInterval)
      }
      animationId = requestAnimationFrame(update)
    }

    const start = () => {
      if (animationId || disposed || document.hidden || !isVisible || prefersReducedMotion) return
      animationId = requestAnimationFrame(update)
    }

    const handlePointerMove = (event) => {
      if (!interactive || prefersReducedMotion) return
      const bounds = boundsDirty || !cachedBounds ? refreshBounds() : cachedBounds
      if (bounds.width <= 0 || bounds.height <= 0) return
      const x = (event.clientX - bounds.left) / bounds.width
      const y = 1 - (event.clientY - bounds.top) / bounds.height
      mouseTarget.x = Math.min(1, Math.max(0, x))
      mouseTarget.y = Math.min(1, Math.max(0, y))
    }

    const handleVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    const handleMotionPreference = (event) => {
      prefersReducedMotion = event.matches
      if (prefersReducedMotion) {
        stop()
        render(0)
      } else {
        start()
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (prefersReducedMotion) render(0)
    })
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
        cachedBounds = entry.boundingClientRect
        boundsDirty = false
      }
      if (isVisible) start()
      else stop()
    }, { rootMargin: '120px' })

    container.appendChild(gl.canvas)
    resizeObserver.observe(container)
    visibilityObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotionQuery.addEventListener?.('change', handleMotionPreference)
    if (interactive) window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('resize', markBoundsDirty, { passive: true })
    window.addEventListener('scroll', markBoundsDirty, { passive: true, capture: true })

    resize()
    render(0)
    start()

    return () => {
      disposed = true
      stop()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotionQuery.removeEventListener?.('change', handleMotionPreference)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('resize', markBoundsDirty)
      window.removeEventListener('scroll', markBoundsDirty, true)
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [colorR, colorG, colorB, speed, amplitude, frequencyX, frequencyY, interactive, dprLimit, fpsLimit])

  return (
    <div
      ref={containerRef}
      className={`liquidChrome-container ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  )
}

export default LiquidChrome
