import './ShinyText.css'

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
}) {
  const classes = [
    'rb-shiny-text',
    className,
    disabled ? 'is-disabled' : '',
    yoyo ? 'is-yoyo' : '',
    pauseOnHover ? 'is-pausable' : '',
  ].filter(Boolean).join(' ')

  const style = {
    '--shine-base': color,
    '--shine-color': shineColor,
    '--shine-angle': `${spread}deg`,
    '--shine-duration': `${Math.max(speed, 0.1)}s`,
    '--shine-delay': `${Math.max(delay, 0)}s`,
    '--shine-direction': direction === 'right' ? 'reverse' : 'normal',
  }

  return (
    <span className={classes} style={style}>
      <span className="rb-shiny-text__base">{text}</span>
      <span className="rb-shiny-text__shine" aria-hidden="true">{text}</span>
    </span>
  )
}
