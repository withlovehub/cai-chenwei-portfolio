import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './FlowingMenu.css'

const distanceSquared = (x, y, x2, y2) => (x - x2) ** 2 + (y - y2) ** 2

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120f17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120f17',
  borderColor = '#fff',
  staticMotion = false,
}) {
  return (
    <div className="flowing-menu" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu__nav" aria-label="精选实践快速索引">
        {items.map((item, index) => (
          <FlowingMenuItem
            key={`${item.text}-${index}`}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            staticMotion={staticMotion}
          />
        ))}
      </nav>
    </div>
  )
}

function FlowingMenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor, staticMotion = false }) {
  const itemRef = useRef(null)
  const marqueeRef = useRef(null)
  const marqueeInnerRef = useRef(null)
  const animationRef = useRef(null)
  const isActiveRef = useRef(false)
  const [repetitions, setRepetitions] = useState(4)

  const findClosestEdge = (mouseX, mouseY, width, height) =>
    distanceSquared(mouseX, mouseY, width / 2, 0) < distanceSquared(mouseX, mouseY, width / 2, height)
      ? 'top'
      : 'bottom'

  useEffect(() => {
    const calculateRepetitions = () => {
      const content = marqueeInnerRef.current?.querySelector('.flowing-menu__marquee-part')
      if (!content) return
      const needed = Math.ceil(window.innerWidth / Math.max(content.offsetWidth, 1)) + 2
      setRepetitions(Math.max(4, needed))
    }

    calculateRepetitions()
    window.addEventListener('resize', calculateRepetitions)
    return () => window.removeEventListener('resize', calculateRepetitions)
  }, [text, image])

  useEffect(() => {
    const setupMarquee = () => {
      const inner = marqueeInnerRef.current
      const content = inner?.querySelector('.flowing-menu__marquee-part')
      if (!inner || !content || content.offsetWidth === 0) return

      animationRef.current?.kill()
      // 低性能模式（staticMotion）下不启动无限 marquee，保留静态列表；
      // 与 prefers-reduced-motion 走同一条静态路径，避免持续 GSAP RAF。
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || staticMotion) {
        gsap.set(inner, { x: 0 })
        return
      }

      animationRef.current = gsap.to(inner, {
        x: -content.offsetWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      })
    }

    const timer = window.setTimeout(setupMarquee, 50)
    return () => {
      window.clearTimeout(timer)
      animationRef.current?.kill()
    }
  }, [text, image, repetitions, speed, staticMotion])

  useEffect(
    () => () => {
      gsap.killTweensOf([marqueeRef.current, marqueeInnerRef.current])
    },
    [],
  )

  const moveOverlay = (event, entering) => {
    const item = itemRef.current
    const marquee = marqueeRef.current
    const inner = marqueeInnerRef.current
    if (!item || !marquee || !inner) return

    const rect = item.getBoundingClientRect()
    const edge = findClosestEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height)
    const offset = edge === 'top' ? '-101%' : '101%'
    const innerOffset = edge === 'top' ? '101%' : '-101%'
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.58

    if (entering) {
      gsap.timeline({ defaults: { duration, ease: 'expo.out' } })
        .set(marquee, { y: offset }, 0)
        .set(inner, { y: innerOffset }, 0)
        .to([marquee, inner], { y: '0%' }, 0)
    } else {
      gsap.timeline({ defaults: { duration, ease: 'expo.out' } })
        .to(marquee, { y: offset }, 0)
        .to(inner, { y: innerOffset }, 0)
    }
  }

  const handleEnter = (event) => {
    if (isActiveRef.current) return
    isActiveRef.current = true
    moveOverlay(event, true)
  }

  const handleLeave = (event) => {
    if (!isActiveRef.current) return
    isActiveRef.current = false
    moveOverlay(event, false)
  }

  return (
    <div
      className="flowing-menu__item"
      ref={itemRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleEnter}
      onMouseLeave={handleLeave}
      style={{ borderColor }}
    >
      <a
        className="flowing-menu__link"
        href={link}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div className="flowing-menu__marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="flowing-menu__marquee-clip">
          <div className="flowing-menu__marquee-inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }, (_, index) => (
              <div className="flowing-menu__marquee-part" key={index} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="flowing-menu__image" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlowingMenu
