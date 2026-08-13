import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react'
import './VerticalCylinderMenu.css'

const wrapOffset = (value, count) => {
  const half = count / 2
  let wrapped = value
  while (wrapped > half) wrapped -= count
  while (wrapped < -half) wrapped += count
  return wrapped
}

const wrapIndex = (value, count) => ((value % count) + count) % count

export default function VerticalCylinderMenu({ items = [], onSelect }) {
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const frameRef = useRef(0)
  const wakeRef = useRef(() => {})
  const currentRef = useRef(0)
  const targetRef = useRef(0)
  const dragRef = useRef({ active: false, startY: 0, startTarget: 0, moved: false })
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const count = items.length

  const step = (direction) => {
    targetRef.current = Math.round(targetRef.current) + direction
    wakeRef.current()
  }

  useEffect(() => {
    if (!count) return undefined

    const root = rootRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let mounted = true
    let isIntersecting = true

    const stopRendering = () => {
      if (!frameRef.current) return
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }

    const render = () => {
      frameRef.current = 0
      if (!mounted || document.hidden || !isIntersecting) return

      const pointer = pointerRef.current
      pointer.x += (pointer.targetX - pointer.x) * 0.075
      pointer.y += (pointer.targetY - pointer.y) * 0.075
      const pointerSettled = Math.abs(pointer.targetX - pointer.x) < 0.0005
        && Math.abs(pointer.targetY - pointer.y) < 0.0005
      if (pointerSettled) {
        pointer.x = pointer.targetX
        pointer.y = pointer.targetY
      }

      const ease = prefersReducedMotion ? 1 : 0.085
      currentRef.current += (targetRef.current - currentRef.current) * ease
      const positionSettled = Math.abs(targetRef.current - currentRef.current) < 0.0005
      if (positionSettled) {
        currentRef.current = targetRef.current
      }

      const active = wrapIndex(Math.round(currentRef.current), count)
      setActiveIndex((previous) => (previous === active ? previous : active))

      const rect = root?.getBoundingClientRect()
      const height = rect?.height || window.innerHeight
      const radius = Math.min(390, Math.max(270, height * 0.47))
      const angleStep = height < 620 ? 54 : 58

      cardRefs.current.forEach((card, index) => {
        if (!card) return
        const offset = wrapOffset(index - currentRef.current, count)
        const angle = offset * angleStep
        const absoluteAngle = Math.abs(angle)
        const radians = angle * Math.PI / 180
        const y = Math.sin(radians) * radius
        const z = (Math.cos(radians) - 1) * radius
        const frontFactor = Math.max(0, Math.cos(radians))
        const sideFade = Math.max(0, Math.min(1, (96 - absoluteAngle) / 24))
        const centerFactor = Math.exp(-Math.pow(absoluteAngle / 42, 2))
        const offCenterFactor = 1 - centerFactor
        const tiltX = -pointer.y * 1.8 * offCenterFactor
        const tiltY = pointer.x * 3 * offCenterFactor
        const rotationX = -angle + tiltX
        const opacity = absoluteAngle >= 96
          ? 0
          : Math.min(1, (0.06 + Math.pow(frontFactor, 1.22) * 0.94) * sideFade)
        const scale = 0.992 + centerFactor * 0.008
        const blur = Math.pow(1 - frontFactor, 1.18) * 2.6
        const brightness = 0.62 + frontFactor * 0.38
        const lightY = 50 - Math.sin(radians) * 34

        card.style.cssText = [
          `--cylinder-y:${y.toFixed(2)}px`,
          `--cylinder-z:${z.toFixed(2)}px`,
          `--cylinder-rx:${rotationX.toFixed(2)}deg`,
          `--cylinder-ry:${tiltY.toFixed(2)}deg`,
          `--cylinder-scale:${scale.toFixed(3)}`,
          `--cylinder-opacity:${opacity.toFixed(3)}`,
          `--cylinder-blur:${blur.toFixed(2)}px`,
          `--cylinder-brightness:${brightness.toFixed(3)}`,
          `--cylinder-light-y:${lightY.toFixed(2)}%`,
          `z-index:${Math.max(1, Math.round(100 + (z / radius) * 72))}`,
          `visibility:${absoluteAngle >= 96 ? 'hidden' : 'visible'}`,
        ].join(';')
      })

      if (dragRef.current.active || !positionSettled || !pointerSettled) {
        frameRef.current = requestAnimationFrame(render)
      }
    }

    const startRendering = () => {
      if (!mounted || document.hidden || !isIntersecting || frameRef.current) return
      frameRef.current = requestAnimationFrame(render)
    }
    wakeRef.current = startRendering

    const handleVisibilityChange = () => {
      if (document.hidden) stopRendering()
      else startRendering()
    }

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting
        if (isIntersecting) startRendering()
        else stopRendering()
      }, { threshold: 0.01 })
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(startRendering)

    observer?.observe(root)
    resizeObserver?.observe(root)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startRendering()

    return () => {
      mounted = false
      observer?.disconnect()
      resizeObserver?.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeRef.current === startRendering) wakeRef.current = () => {}
      stopRendering()
    }
  }, [count])

  useEffect(() => {
    const focusedCard = document.activeElement?.closest?.('[data-directory-index]')
    if (focusedCard && rootRef.current?.contains(focusedCard)) {
      cardRefs.current[activeIndex]?.focus({ preventScroll: true })
    }
  }, [activeIndex])

  if (!count) return null

  const handlePointerMove = (event) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      pointerRef.current.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointerRef.current.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }
    wakeRef.current()

    if (!dragRef.current.active) return
    const delta = event.clientY - dragRef.current.startY
    if (Math.abs(delta) > 4 && !dragRef.current.moved) {
      dragRef.current.moved = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    targetRef.current = dragRef.current.startTarget - delta / 210
  }

  const finishDrag = (event) => {
    if (!dragRef.current.active) return
    const wasMoved = dragRef.current.moved
    dragRef.current.active = false
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    targetRef.current = Math.round(targetRef.current)
    if (!wasMoved) {
      const card = event.target.closest?.('[data-directory-index]')
      const index = Number(card?.dataset.directoryIndex)
      if (Number.isInteger(index) && items[index]) {
        const offset = wrapOffset(index - currentRef.current, count)
        if (Math.abs(offset) <= 0.34) {
          onSelect?.(items[index])
        } else {
          targetRef.current = currentRef.current + offset
        }
      }
    }
    wakeRef.current()
  }

  return (
    <div
      ref={rootRef}
      className={`vertical-cylinder${isDragging ? ' is-dragging' : ''}`}
      role="region"
      aria-label="竖向循环个人目录"
      tabIndex={0}
      onWheel={(event) => {
        event.preventDefault()
        targetRef.current += Math.sign(event.deltaY) * Math.min(0.7, Math.abs(event.deltaY) / 280)
        wakeRef.current()
      }}
      onPointerDown={(event) => {
        dragRef.current = {
          active: true,
          startY: event.clientY,
          startTarget: targetRef.current,
          moved: false,
        }
        setIsDragging(true)
        wakeRef.current()
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={() => {
        pointerRef.current.targetX = 0
        pointerRef.current.targetY = 0
        if (dragRef.current.active && !dragRef.current.moved) {
          dragRef.current.active = false
          targetRef.current = Math.round(targetRef.current)
          setIsDragging(false)
        }
        wakeRef.current()
      }}
      onLostPointerCapture={() => {
        if (!dragRef.current.active) return
        dragRef.current.active = false
        targetRef.current = Math.round(targetRef.current)
        setIsDragging(false)
        wakeRef.current()
      }}
      onKeyDown={(event) => {
        const isDirectorySurface = event.target === event.currentTarget
          || event.target.closest?.('[data-directory-index]')
        if (!isDirectorySurface) return
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          step(-1)
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          step(1)
        }
        if (event.key === 'Enter' && event.target === event.currentTarget) {
          onSelect?.(items[activeIndex])
        }
      }}
    >
      <div className="vertical-cylinder__axis" aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      <div className="vertical-cylinder__stage">
        {items.map((item, index) => {
          const isActive = index === activeIndex
          const isNearActive = Math.abs(wrapOffset(index - activeIndex, count)) <= 1
          return (
            <button
              ref={(element) => { cardRefs.current[index] = element }}
              type="button"
              key={item.id}
              data-directory-index={index}
              className={`vertical-cylinder__card${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.code} ${item.title}，点击进入`}
              tabIndex={isActive ? 0 : -1}
              onClick={(event) => {
                if (event.detail === 0) onSelect?.(item)
              }}
            >
              <span className="vertical-cylinder__media" aria-hidden="true">
                <img
                  src={item.image}
                  alt=""
                  draggable="false"
                  loading={isNearActive ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </span>
              <span className="vertical-cylinder__shade" aria-hidden="true" />
              <span className="vertical-cylinder__content">
                <span className="vertical-cylinder__meta">
                  <span>SECTION / {item.code}</span>
                  <span>{String(index + 1).padStart(2, '0')} — {String(count).padStart(2, '0')}</span>
                </span>
                <strong>{item.title}</strong>
                <span className="vertical-cylinder__description">{item.description}</span>
                <span className="vertical-cylinder__action">
                  点击进入
                  <ArrowUpRight size={17} strokeWidth={1.6} />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="vertical-cylinder__controls" aria-label="目录切换">
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => step(-1)} aria-label="上一个目录">
          <ArrowUp size={17} />
        </button>
        <span role="status" aria-live="polite" aria-atomic="true">
          <strong>{String(activeIndex + 1).padStart(2, '0')}</strong> / {String(count).padStart(2, '0')}
        </span>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => step(1)} aria-label="下一个目录">
          <ArrowDown size={17} />
        </button>
      </div>

      <div className="vertical-cylinder__dots" aria-hidden="true">
        {items.map((item, index) => (
          <span key={item.id} className={index === activeIndex ? 'is-active' : ''} />
        ))}
      </div>
    </div>
  )
}
