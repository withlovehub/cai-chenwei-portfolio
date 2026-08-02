import { useRef } from 'react'
import './SpotlightCard.css'

export default function SpotlightCard({
  children,
  as: Tag = 'article',
  className = '',
  spotlightColor = 'rgba(103, 231, 255, 0.24)',
  ...props
}) {
  const ref = useRef(null)

  const onMouseMove = (event) => {
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
    element.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
    element.style.setProperty('--spotlight-color', spotlightColor)
    element.classList.add('is-pointer-active')
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => ref.current?.classList.remove('is-pointer-active')}
      className={`rb-spotlight-card ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  )
}
