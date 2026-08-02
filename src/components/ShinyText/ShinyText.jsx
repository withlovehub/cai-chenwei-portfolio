import './ShinyText.css'

export default function ShinyText({
  text,
  className = '',
  color = 'rgba(255,255,255,0.5)',
  shineColor = '#ffffff',
  speed = 4,
}) {
  return (
    <span
      className={`rb-shiny-text ${className}`.trim()}
      style={{ '--shine-base': color, '--shine-color': shineColor, '--shine-speed': `${speed}s` }}
    >
      {text}
    </span>
  )
}
