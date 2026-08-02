import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './RotatingText.css'

const classNames = (...classes) => classes.filter(Boolean).join(' ')

const RotatingText = forwardRef((props, ref) => {
  const {
    texts = [],
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props

  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  const splitIntoCharacters = (text) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
      return Array.from(segmenter.segment(text), (segment) => segment.segment)
    }
    return Array.from(text)
  }

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex] ?? ''
    if (splitBy === 'characters') {
      return currentText.split(' ').map((word, index, words) => ({
        characters: splitIntoCharacters(word),
        needsSpace: index !== words.length - 1,
      }))
    }
    if (splitBy === 'words') {
      return currentText.split(' ').map((word, index, words) => ({
        characters: [word],
        needsSpace: index !== words.length - 1,
      }))
    }
    if (splitBy === 'lines') {
      return currentText.split('\n').map((line, index, lines) => ({
        characters: [line],
        needsSpace: index !== lines.length - 1,
      }))
    }
    return currentText.split(splitBy).map((part, index, parts) => ({
      characters: [part],
      needsSpace: index !== parts.length - 1,
    }))
  }, [texts, currentTextIndex, splitBy])

  const getStaggerDelay = useCallback(
    (index, total) => {
      if (reduceMotion) return 0
      if (staggerFrom === 'first') return index * staggerDuration
      if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration
      if (staggerFrom === 'center') return Math.abs(Math.floor(total / 2) - index) * staggerDuration
      if (staggerFrom === 'random') return Math.abs(Math.floor(Math.random() * total) - index) * staggerDuration
      return Math.abs(staggerFrom - index) * staggerDuration
    },
    [staggerFrom, staggerDuration, reduceMotion],
  )

  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex)
      onNext?.(newIndex)
    },
    [onNext],
  )

  const next = useCallback(() => {
    if (!texts.length) return
    const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1
    if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex)
  }, [currentTextIndex, texts.length, loop, handleIndexChange])

  const previous = useCallback(() => {
    if (!texts.length) return
    const previousIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1
    if (previousIndex !== currentTextIndex) handleIndexChange(previousIndex)
  }, [currentTextIndex, texts.length, loop, handleIndexChange])

  const jumpTo = useCallback(
    (index) => {
      if (!texts.length) return
      const validIndex = Math.max(0, Math.min(index, texts.length - 1))
      if (validIndex !== currentTextIndex) handleIndexChange(validIndex)
    },
    [texts.length, currentTextIndex, handleIndexChange],
  )

  const reset = useCallback(() => currentTextIndex !== 0 && handleIndexChange(0), [currentTextIndex, handleIndexChange])

  useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset])

  useEffect(() => {
    if (!auto || reduceMotion || texts.length < 2) return undefined
    const intervalId = window.setInterval(next, rotationInterval)
    return () => window.clearInterval(intervalId)
  }, [next, rotationInterval, auto, reduceMotion, texts.length])

  if (!texts.length) return null

  const effectiveTransition = reduceMotion ? { duration: 0 } : transition

  return (
    <motion.span className={classNames('text-rotate', mainClassName)} {...rest} layout transition={effectiveTransition}>
      <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={classNames(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObject, wordIndex, array) => {
            const previousCharacters = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0)
            const totalCharacters = array.reduce((sum, word) => sum + word.characters.length, 0)
            return (
              <span key={wordIndex} className={classNames('text-rotate-word', splitLevelClassName)}>
                {wordObject.characters.map((character, characterIndex) => (
                  <motion.span
                    key={`${character}-${characterIndex}`}
                    initial={reduceMotion ? animate : initial}
                    animate={animate}
                    exit={reduceMotion ? animate : exit}
                    transition={{
                      ...effectiveTransition,
                      delay: getStaggerDelay(previousCharacters + characterIndex, totalCharacters),
                    }}
                    className={classNames('text-rotate-element', elementLevelClassName)}
                  >
                    {character}
                  </motion.span>
                ))}
                {wordObject.needsSpace && <span className="text-rotate-space"> </span>}
              </span>
            )
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
})

RotatingText.displayName = 'RotatingText'
export default RotatingText
