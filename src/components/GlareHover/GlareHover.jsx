import './GlareHover.css'

export default function GlareHover({
  children,
  as: Tag = 'div',
  className = '',
  glareColor = '#67e7ff',
  glareOpacity = 0.24,
  glareAngle = -38,
  glareSize = 220,
  duration = 850,
  ...props
}) {
  const hex = glareColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const rgba = Number.isNaN(r) ? glareColor : `rgba(${r}, ${g}, ${b}, ${glareOpacity})`

  return (
    <Tag
      className={`rb-glare-hover ${className}`.trim()}
      style={{
        '--glare-angle': `${glareAngle}deg`,
        '--glare-duration': `${duration}ms`,
        '--glare-size': `${glareSize}%`,
        '--glare-color': rgba,
      }}
      {...props}
      onMouseMove={(event) => event.currentTarget.classList.add('is-pointer-active')}
      onMouseLeave={(event) => event.currentTarget.classList.remove('is-pointer-active')}
    >
      {children}
    </Tag>
  )
}
