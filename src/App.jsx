import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ArrowLeft,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Command,
  GitBranch,
  GitFork,
  Home,
  Layers3,
  Mail,
  Menu,
  MousePointer2,
  Play,
  Search,
  Star,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { experiences, githubRepositories, metrics, profile, projects, strengths } from './data'
import BlurText from './components/BlurText/BlurText'
import ClickSpark from './components/ClickSpark/ClickSpark'
import DecryptedText from './components/DecryptedText/DecryptedText'
import GlareHover from './components/GlareHover/GlareHover'
import Magnet from './components/Magnet/Magnet'
import RotatingText from './components/RotatingText/RotatingText'
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity'
import ShinyText from './components/ShinyText/ShinyText'
import SpotlightCard from './components/SpotlightCard/SpotlightCard'
import TiltedCard from './components/TiltedCard/TiltedCard'
import VerticalCylinderMenu from './components/VerticalCylinderMenu/VerticalCylinderMenu'

const portfolioDirectory = [
  {
    id: 'about',
    title: '关于我',
    code: '01',
    description: '身份、方向、个人理念与现在正在建立的能力系统。',
    image: '/assets/directory-about-v2.webp',
  },
  {
    id: 'experience',
    title: '个人经历',
    code: '02',
    description: '从校园组织、电子技术实践到教育工作，一段有迹可循的成长路径。',
    image: '/assets/directory-experience-v2.webp',
  },
  {
    id: 'projects',
    title: '项目作品',
    code: '03',
    description: '项目实践、GitHub 开源作品，以及想法如何真正变成可以运行的结果。',
    image: '/assets/directory-projects-v2.webp',
  },
  {
    id: 'strengths',
    title: '能力系统',
    code: '04',
    description: 'AI Agent、编程基础、数据跟进与协作能力组成的个人工作方式。',
    image: '/assets/directory-strengths-v2.webp',
  },
  {
    id: 'contact',
    title: '与我联系',
    code: '05',
    description: '如果你对我的经历或作品感兴趣，可以从这里找到我。',
    image: '/assets/directory-contact-v2.webp',
  },
]

const Crosshair = lazy(() => import('./components/Crosshair/Crosshair'))
const ContactHub = lazy(() => import('./components/ContactHub/ContactHub'))
const FlowingMenu = lazy(() => import('./components/FlowingMenu/FlowingMenu'))
const ScrollReveal = lazy(() => import('./components/ScrollReveal/ScrollReveal'))
const ScrollFloat = lazy(() => import('./components/ScrollFloat/ScrollFloat'))
const ThreeHero = lazy(() => import('./components/ThreeHero/ThreeHero'))
const KineticIris = lazy(() => import('./components/KineticIris/KineticIris'))
const MaskedHeading = lazy(() => import('./components/MaskedHeading/MaskedHeading'))
const LiquidChrome = lazy(() => import('./components/LiquidChrome/LiquidChrome'))

const navItems = [
  { id: 'about', label: '关于', href: '#about', code: '01' },
  { id: 'experience', label: '经历', href: '#experience', code: '02' },
  { id: 'projects', label: '项目', href: '#projects', code: '03' },
  { id: 'strengths', label: '能力', href: '#strengths', code: '04' },
]

const appSections = [
  { id: 'home', label: '首页', code: '00', icon: Home, hint: '个人主页' },
  ...navItems.map((item) => ({ ...item, icon: item.id === 'about' ? UserRound : Layers3, hint: item.label })),
  { id: 'contact', label: '联系', code: '05', icon: Mail, hint: '联系我' },
]

const motionScenes = [
  {
    key: 'sense',
    phase: 'INPUT',
    title: '感知',
    en: 'SENSE THE SIGNAL',
    text: '鼠标、滚动和点击不再只是触发器，而是主视觉的实时输入。',
  },
  {
    key: 'build',
    phase: 'PROCESS',
    title: '构建',
    en: 'BUILD THE SYSTEM',
    text: 'Three.js、视频与界面状态被编排成同一套可响应的视觉系统。',
  },
  {
    key: 'verify',
    phase: 'FEEDBACK',
    title: '验证',
    en: 'VERIFY THE RESULT',
    text: '每一次操作都有立即可见的位移、光线、层级与状态反馈。',
  },
  {
    key: 'grow',
    phase: 'OUTPUT',
    title: '生长',
    en: 'KEEP IT EVOLVING',
    text: '内容和能力继续更新时，动效体系也能跟着扩展，而不是一次性装饰。',
  },
]

function SectionEyebrow({ index, children, light = false }) {
  return (
    <div className={`section-eyebrow ${light ? 'is-light' : ''}`}>
      <span>{index}</span>
      <span className="eyebrow-line" />
      <DecryptedText
        text={String(children)}
        speed={22}
        revealDirection="start"
        animateOn="view"
        className="eyebrow-decrypted"
        encryptedClassName="eyebrow-encrypted"
      />
    </div>
  )
}

function KineticButton({ className = '', children, onClick, ...props }) {
  const buttonRef = useRef(null)

  const onPointerMove = (event) => {
    const button = buttonRef.current
    if (!button || event.pointerType === 'touch') return
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const moveX = ((x / rect.width) - 0.5) * 10
    const moveY = ((y / rect.height) - 0.5) * 8
    button.style.setProperty('--pointer-x', `${x}px`)
    button.style.setProperty('--pointer-y', `${y}px`)
    button.style.setProperty('--magnetic-x', `${moveX}px`)
    button.style.setProperty('--magnetic-y', `${moveY}px`)
  }

  const resetPointer = () => {
    const button = buttonRef.current
    if (!button) return
    button.style.setProperty('--magnetic-x', '0px')
    button.style.setProperty('--magnetic-y', '0px')
  }

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      className={`kinetic-button ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      onBlur={resetPointer}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Header({ menuOpen, setMenuOpen, activeSection, onOpenCommand }) {
  const darkSection = ['home', 'projects', 'contact'].includes(activeSection)

  return (
    <header className={`site-header app-header ${darkSection ? 'is-dark' : 'is-light'}`}>
      <a className="brand" href="#home" aria-label="返回首页">
        <span className="brand-mark">{profile.mark}</span>
        <span className="brand-copy">
          PORTFOLIO
          <br />
          FOLIO ©26
        </span>
      </a>

      <nav className="desktop-nav" aria-label="主要导航">
        {navItems.map((item, index) => (
          <a
            className={activeSection === item.id ? 'is-active' : ''}
            href={item.href}
            key={item.href}
            aria-current={activeSection === item.id ? 'location' : undefined}
          >
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="header-command" type="button" onClick={onOpenCommand} aria-label="打开快捷指令">
          <Search size={14} />
          <span>快速导航</span>
          <kbd>⌘ K</kbd>
        </button>
        <a className="header-contact" href="#contact">
          <span className="availability-dot" />
          联系我
          <ArrowDownRight size={15} strokeWidth={1.7} />
        </a>
      </div>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        {navItems.map((item, index) => (
          <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
        <a href="#contact" onClick={() => setMenuOpen(false)}>
          <span>05</span>
          联系我
        </a>
      </div>
    </header>
  )
}

function Hero() {
  const [firstName = 'LIN', ...remainingName] = profile.nameEn.trim().split(/\s+/)
  const secondName = remainingName.join(' ') || 'DU'
  const [boosted, setBoosted] = useState(false)
  const heroRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      video.currentTime = 0
      return
    }
    video.playbackRate = boosted ? 1.18 : 0.76
    video.play().catch(() => {})
  }, [boosted])

  useEffect(() => {
    const hero = heroRef.current
    const video = videoRef.current
    if (!hero || !video) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause()
        return
      }
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }, { rootMargin: '160px' })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return undefined

    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect()
      hero.style.setProperty('--hero-pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
      hero.style.setProperty('--hero-pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
    }

    hero.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => hero.removeEventListener('pointermove', onPointerMove)
  }, [])

  useEffect(() => {
    let animationContext
    let cancelled = false

    const setupMotion = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const gsapModule = await import('gsap')
      const scrollModule = await import('gsap/ScrollTrigger')
      const gsap = gsapModule.gsap || gsapModule.default
      const ScrollTrigger = scrollModule.ScrollTrigger || scrollModule.default
      if (cancelled || !heroRef.current || !gsap || !ScrollTrigger) return

      gsap.registerPlugin(ScrollTrigger)
      animationContext = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo('.hero-media', { opacity: 0 }, { opacity: 1, duration: 1.05 })
          .fromTo('.hero-three-stage', { opacity: 0, scale: 0.72, rotate: -5 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.35 }, 0.18)
          .fromTo('.hero-system-readout, .hero-video-readout', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.08 }, 0.62)

        gsap.to('.hero-media video', {
          scale: 1.16,
          opacity: 0.18,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.1 },
        })
        gsap.to('.hero-three-stage', {
          yPercent: 18,
          scale: 0.82,
          opacity: 0.18,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.9 },
        })
        gsap.to('.hero-title', {
          yPercent: -9,
          opacity: 0.28,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: '32% top', end: 'bottom top', scrub: 0.75 },
        })
      }, heroRef)
    }

    setupMotion()
    return () => {
      cancelled = true
      animationContext?.revert()
    }
  }, [])

  return (
    <section className={`hero ${boosted ? 'is-motion-boosted' : ''}`} id="home" ref={heroRef}>
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/open-source-lab-v2.jpg"
        >
          <source src="/assets/ccw-motion-study.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-three-stage">
        <Suspense fallback={<div className="hero-three-fallback" aria-hidden="true" />}>
          <ThreeHero boosted={boosted} />
        </Suspense>
      </div>

      <div className="hero-interface" aria-hidden="true">
        <i className="hero-corner corner-nw" />
        <i className="hero-corner corner-ne" />
        <i className="hero-corner corner-sw" />
        <i className="hero-corner corner-se" />
        <div className="hero-system-readout">
          <span>CCW / PERSONAL SYSTEM</span>
          <strong>AI AGENT · CODE · EDUCATION</strong>
        </div>
        <div className="hero-system-index">
          <span>IDENT / CCW-2601</span>
          <b>01</b>
          <small>PORTFOLIO / MAIN VISUAL</small>
        </div>
        <div className="hero-tool-rail">
          <span>PROFILE</span>
          <span>JOURNEY</span>
          <span>PRACTICE</span>
          <span>CAPABILITY</span>
        </div>
        <div className="hero-signal-mark"><i /><i /></div>
        <div className="hero-scanline" />
        <div className="hero-video-readout">
          <span>LOCAL MOTION FILM</span>
          <strong>{boosted ? '1.18× / BOOST' : '0.76× / CINEMATIC'}</strong>
        </div>
      </div>

      <div className="hero-side hero-side-left">
        <span>{profile.location}</span>
        <span>32.0603° N · 118.7969° E</span>
      </div>
      <div className="hero-side hero-side-right">
        <ShinyText text="SCROLL TO EXPLORE" speed={3.2} />
        <ArrowDown size={14} />
      </div>

      <div className="hero-content">
        <div className="hero-kicker hero-kicker-live">
          <BlurText
            text={profile.role}
            delay={24}
            animateBy="letters"
            direction="top"
            stepDuration={0.28}
            className="hero-role-blur"
          />
          <span className="hero-status">
            <i />
            <RotatingText
              texts={['LEARNING', 'BUILDING', 'COLLABORATING']}
              rotationInterval={2600}
              staggerFrom="last"
              staggerDuration={0.018}
              splitBy="characters"
              mainClassName="hero-status-rotating"
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            />
          </span>
        </div>

        <h1
          className={`hero-title ${Math.max(firstName.length, secondName.length) > 5 ? 'is-long-name' : ''}`}
          aria-label={`${profile.nameEn} personal portfolio`}
        >
          <span className="title-line reveal-up delay-2">{firstName}</span>
          <span className="title-line title-line-offset reveal-up delay-3">
            {secondName}<span className="title-dot">.</span>
          </span>
        </h1>

        <div className="hero-bottom reveal-up delay-4">
          <p>
            用 AI Agent 加速想法落地
            <br />
            用代码与验证把结果做实
          </p>
          <Magnet className="hero-round-magnet" padding={110} strength={3.6}>
            <a className="round-link" href="#about" aria-label="向下查看关于我">
              <ArrowDownRight size={32} strokeWidth={1.15} />
            </a>
          </Magnet>
          <span className="hero-edition">SIGNAL / LEARNING · AI · OPEN SOURCE<br />SYSTEM ACTIVE · 2025—2026</span>
        </div>
      </div>

      <KineticButton
        className="hero-motion-toggle"
        onClick={() => setBoosted((active) => !active)}
        aria-pressed={boosted}
        aria-label={boosted ? '关闭主视觉增强动效' : '开启主视觉增强动效'}
      >
        <span className="hero-motion-toggle-icon">{boosted ? <Zap size={18} /> : <Play size={17} />}</span>
        <span>
          <strong>{boosted ? 'MOTION BOOSTED' : 'WAKE THE SCENE'}</strong>
          <small>VIDEO × THREE.JS × POINTER</small>
        </span>
      </KineticButton>
    </section>
  )
}

function MotionLab() {
  const [activeScene, setActiveScene] = useState(0)
  const sectionRef = useRef(null)
  const filmRef = useRef(null)
  const scene = motionScenes[activeScene]

  useEffect(() => {
    const section = sectionRef.current
    const video = filmRef.current
    if (!section || !video) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause()
        return
      }
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }, { rootMargin: '180px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let animationContext
    let cancelled = false

    const setupMotion = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const gsapModule = await import('gsap')
      const scrollModule = await import('gsap/ScrollTrigger')
      const gsap = gsapModule.gsap || gsapModule.default
      const ScrollTrigger = scrollModule.ScrollTrigger || scrollModule.default
      if (cancelled || !sectionRef.current || !gsap || !ScrollTrigger) return

      gsap.registerPlugin(ScrollTrigger)
      animationContext = gsap.context(() => {
        gsap.fromTo('.motion-lab-shell',
          { scale: 0.88, clipPath: 'inset(10% 6% 10% 6% round 34px)' },
          {
            scale: 1,
            clipPath: 'inset(0% 0% 0% 0% round 34px)',
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: '42% center', scrub: 0.9 },
          },
        )
        gsap.fromTo('.motion-lab-film video',
          { scale: 0.9, yPercent: -6 },
          {
            scale: 1.18,
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.25 },
          },
        )
        gsap.to('.motion-lab-orbit', {
          rotate: 210,
          ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      }, sectionRef)
    }

    setupMotion()
    return () => {
      cancelled = true
      animationContext?.revert()
    }
  }, [])

  return (
    <section className="motion-lab" id="motion" ref={sectionRef} aria-labelledby="motion-lab-title">
      <div className="motion-lab-shell" data-active={scene.key}>
        <div className="motion-lab-film" aria-hidden="true">
          <video ref={filmRef} autoPlay muted loop playsInline preload="metadata">
            <source src="/assets/ccw-motion-study.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="motion-lab-wash" aria-hidden="true" />
        <div className="motion-lab-orbit" aria-hidden="true"><i /><i /><i /></div>

        <header className="motion-lab-heading">
          <span>MOTION SYSTEM / LIVE</span>
          <h2 id="motion-lab-title">这不是背景，<br />是正在响应你的界面。</h2>
          <p>把视频当作情绪层，把 Three.js 当作空间层，把点击和滚动变成真正的控制信号。</p>
        </header>

        <div className="motion-accordion" role="list" aria-label="动效系统的四个阶段">
          {motionScenes.map((item, index) => {
            const isActive = index === activeScene
            return (
              <button
                type="button"
                className={isActive ? 'is-active' : ''}
                key={item.key}
                aria-pressed={isActive}
                onMouseEnter={() => setActiveScene(index)}
                onFocus={() => setActiveScene(index)}
                onClick={() => setActiveScene(index)}
              >
                <span className="motion-chapter-phase">{item.phase}</span>
                <span className="motion-chapter-number">0{index + 1}</span>
                <span className="motion-chapter-copy">
                  <small>{item.en}</small>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <ArrowUpRight size={20} strokeWidth={1.3} />
              </button>
            )
          })}
        </div>

        <div className="motion-lab-readout">
          <span><MousePointer2 size={14} /> HOVER / EXPAND</span>
          <span>ACTIVE SIGNAL / {scene.phase}</span>
          <span>VIDEO + WEBGL + GSAP</span>
        </div>
      </div>
    </section>
  )
}

function About() {
  const portrait = (
    <figure className="portrait-card">
      <img
        src="/assets/avatar-cai.jpg"
        alt="蔡辰玮的个人头像"
        loading="lazy"
        decoding="async"
      />
      <div className="portrait-overlay" />
      <figcaption>
        <span>PORTRAIT / 2026</span>
        <span>NO. 001</span>
      </figcaption>
    </figure>
  )

  return (
    <section className="about section-pad" id="about">
      <SectionEyebrow index="01">PROFILE / 关于我</SectionEyebrow>

      <div className="about-head section-reveal">
        <h2>
          我把<span>学习</span>的过程
          <br />
          变成解决问题的能力。
        </h2>
        <Suspense fallback={<p className="about-lead">{profile.intro}</p>}>
          <ScrollReveal
            enableBlur={false}
            baseOpacity={0.2}
            baseRotation={1.5}
            blurStrength={5}
            rotationEnd="bottom 72%"
            wordAnimationEnd="bottom 72%"
            containerClassName="about-lead-reveal"
            textClassName="about-lead"
          >
            {profile.intro}
          </ScrollReveal>
        </Suspense>
      </div>

      <div className="profile-layout section-reveal">
        <TiltedCard className="profile-tilt" rotateAmplitude={5.5} scaleOnHover={1.012}>
          {portrait}
        </TiltedCard>

        <div className="profile-content">
          <div className="profile-quote">
            <span>“</span>
            <p>{profile.quote}</p>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span>NAME</span>
              <strong>{profile.nameZh} / {profile.nameEn}</strong>
            </div>
            <div className="detail-row">
              <span>EDUCATION</span>
              <strong>{profile.school} / {profile.major}</strong>
            </div>
            <div className="detail-row">
              <span>FOCUS</span>
              <strong>AI AGENTS · SOFTWARE BUILDING · AUTOMATION</strong>
            </div>
            <div className="detail-row">
              <span>STACK</span>
              <strong>C / C++ / PYTHON · LANGCHAIN · JAVA (LEARNING)</strong>
            </div>
            <div className="detail-row">
              <span>LANGUAGE</span>
              <strong>{profile.language}</strong>
            </div>
            <div className="detail-row">
              <span>CONTACT</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </div>

          <div className="metrics-grid">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <span className="metric-scope">{metric.category}</span>
                <strong>{metric.value}</strong>
                <span className="metric-label">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Experience() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeExperience = experiences[activeIndex]

  const moveExperience = (direction) => {
    setActiveIndex((current) => (current + direction + experiences.length) % experiences.length)
  }

  return (
    <section className="experience section-pad" id="experience">
      <SectionEyebrow index="02">JOURNEY / 个人经历</SectionEyebrow>

      <div className="section-title-row section-reveal">
        <Suspense fallback={<h2 className="experience-float-title">我的路径不是直线，<br />但每一步都有迹可循。</h2>}>
          <ScrollFloat as="h2" className="experience-float-title">
            {'我的路径不是直线，\n但每一步都有迹可循。'}
          </ScrollFloat>
        </Suspense>
        <p>从班级管理、电子系统仿真到教育实践，我在真实任务中持续训练自己的工作方法。</p>
      </div>

      <div className="journey-workspace section-reveal">
        <div className="journey-tabs" role="tablist" aria-label="个人经历">
          <div className="journey-tabs-head">
            <span>JOURNEY DIRECTORY</span>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(experiences.length).padStart(2, '0')}</span>
          </div>
          {experiences.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              className={`journey-tab ${activeIndex === index ? 'is-active' : ''}`}
              key={item.period}
              onClick={() => setActiveIndex(index)}
            >
              <span>0{index + 1}</span>
              <span>
                <strong>{item.title.split(' / ')[0]}</strong>
                <small>{item.period}</small>
              </span>
              <ArrowRight size={17} strokeWidth={1.4} />
            </button>
          ))}
        </div>

        <article className="journey-detail" role="tabpanel" key={activeExperience.period}>
          <div className="journey-detail-bar">
            <span>ACTIVE RECORD / 0{activeIndex + 1}</span>
            <span>{activeExperience.recordStatus ?? 'VERIFIED EXPERIENCE'}</span>
          </div>
          <div className="journey-detail-body">
            <span className="journey-detail-index">0{activeIndex + 1}</span>
            <div className="journey-detail-copy">
              <time>{activeExperience.period}</time>
              <h3>{activeExperience.title}</h3>
              <span className="experience-meta">{activeExperience.meta}</span>
              <p>{activeExperience.text}</p>
            </div>
          </div>
          <div className="journey-detail-footer">
            <span>切换左侧目录，查看不同阶段的工作方法与结果</span>
            <div>
              <button type="button" onClick={() => moveExperience(-1)} aria-label="上一段经历"><ArrowLeft size={18} /></button>
              <button type="button" onClick={() => moveExperience(1)} aria-label="下一段经历"><ArrowRight size={18} /></button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

function ProjectCard({ project, index, onInspect }) {
  return (
    <article
      className={`project-card project-card-${index + 1} section-reveal`}
      id={`project-${project.index}`}
      style={{ '--accent': project.accent }}
    >
      <GlareHover className="project-visual" glareColor={project.accent} glareOpacity={0.22} duration={920}>
        <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />
        <div className="project-tint" />
        <div className="project-corner">
          <span style={{ backgroundColor: project.accent }} />
          FEATURED / {project.index}
        </div>
        <button
          type="button"
          className="project-open"
          aria-label={`打开${project.title}详情`}
          onClick={() => onInspect(project)}
        >
          <ArrowUpRight size={26} strokeWidth={1.3} />
        </button>
        <span className="project-watermark">{project.index}</span>
      </GlareHover>
      <div className="project-info">
        <div>
          <DecryptedText
            text={project.category}
            speed={20}
            animateOn="view"
            className="project-category-decrypted"
            encryptedClassName="project-category-encrypted"
          />
          <h3>{project.title}</h3>
        </div>
        <p>{project.description}</p>
        <button className="project-inspect-link" type="button" onClick={() => onInspect(project)}>
          查看项目档案 <ArrowRight size={16} />
        </button>
        <span className="project-en">{project.en}</span>
      </div>
    </article>
  )
}

function GitHubShowcase() {
  return (
    <div className="github-showcase section-reveal" id="github">
      <div className="github-profile-card">
        <div className="github-identity">
          <span className="github-avatar">
            <img src={profile.github.avatar} alt={`${profile.github.username} 的 GitHub 头像`} loading="lazy" decoding="async" />
            <i aria-hidden="true" />
          </span>
          <div>
            <span>GITHUB PROFILE / OPEN SOURCE</span>
            <h3>@{profile.github.username}</h3>
          </div>
        </div>

        <p>把想法写成可以运行、可以复查、也可以继续生长的公开作品。</p>

        <div className="github-profile-stats" aria-label="GitHub 公开数据">
          <span><strong>{profile.github.publicRepos}</strong> PUBLIC REPOS</span>
          <span><strong>{profile.github.totalStars}</strong> TOTAL STARS</span>
        </div>

        <a href={profile.github.url} target="_blank" rel="noreferrer" className="github-profile-link">
          <GitBranch size={18} />
          VISIT PROFILE
          <ArrowUpRight size={17} />
        </a>
      </div>

      <div className="github-repo-grid">
        {githubRepositories.map((repo) => (
          <a
            className="github-repo-card"
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            key={repo.name}
            style={{ '--repo-accent': repo.accent }}
          >
            <div className="github-repo-top">
              <span>{repo.index} / PUBLIC REPOSITORY</span>
              <ArrowUpRight size={22} strokeWidth={1.35} />
            </div>

            <GitBranch className="github-repo-icon" size={34} strokeWidth={1.25} />
            <span className="github-repo-slug">{repo.name}</span>
            <h4>{repo.title}</h4>
            <p>{repo.description}</p>

            <div className="github-repo-tags">
              {repo.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>

            <div className="github-repo-meta">
              <span><i style={{ background: repo.accent }} />{repo.language}</span>
              <span><Star size={13} />{repo.stars}</span>
              <span><GitFork size={13} />{repo.forks}</span>
              <span>{repo.license}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function Projects({ onInspect }) {
  const flowingItems = projects.map((project) => ({
    link: `#project-${project.index}`,
    text: `${project.index} / ${project.title}`,
    image: project.image,
  }))

  return (
    <section className="projects section-pad" id="projects">
      <SectionEyebrow index="03" light>SELECTED PRACTICE / 精选实践</SectionEyebrow>

      <div className="projects-heading section-reveal">
        <h2>一些值得<br />展开讲讲的实践。</h2>
        <p>这些实践来自真实经历，关注学习成长、工作效率与技术能力如何形成可复用的方法。</p>
      </div>

      <div className="project-flow-index section-reveal">
        <div className="flow-index-meta">
          <span>INTERACTIVE INDEX</span>
          <span>HOVER TO EXPLORE / 点击直达</span>
        </div>
        <div className="flow-index-menu">
          <Suspense fallback={<div className="flow-index-loading">LOADING PRACTICE INDEX…</div>}>
            <FlowingMenu
              items={flowingItems}
              speed={13}
              textColor="#f1f1eb"
              bgColor="#080b0d"
              marqueeBgColor="#67e7ff"
              marqueeTextColor="#080b0d"
              borderColor="rgba(255,255,255,0.2)"
            />
          </Suspense>
        </div>
      </div>

      <div className="project-list">
        {projects.map((project, index) => (
          <ProjectCard project={project} index={index} key={project.title} onInspect={onInspect} />
        ))}
      </div>

      <GitHubShowcase />
    </section>
  )
}

function Strengths() {
  return (
    <section className="strengths section-pad" id="strengths">
      <SectionEyebrow index="04">CAPABILITIES / 个人优势</SectionEyebrow>

      <div className="strengths-heading section-reveal">
        <h2>能力不只是软件列表，<br />而是把事情做成的方式。</h2>
        <span className="rotating-stamp" aria-hidden="true">
          <span>THINK · MAKE · LEARN · REPEAT · </span>
          <i>✦</i>
        </span>
      </div>

      <div className="strength-grid section-reveal">
        {strengths.map((item) => (
          <SpotlightCard className="strength-card" spotlightColor="rgba(103, 231, 255, 0.24)" key={item.number}>
            <div className="strength-top">
              <span>{item.number}</span>
              <ArrowDownRight size={22} strokeWidth={1.3} />
            </div>
            <div className="strength-body">
              <span>{item.en}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <div className="strength-tags">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  )
}

function Contact({ activeChannelId, onSelectChannel, onBackChannel, performanceTier }) {
  return (
    <Suspense fallback={<section className="contact contact-hub-loading">CONTACT SYSTEM LOADING…</section>}>
      <ContactHub
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
        onBackChannel={onBackChannel}
        performanceTier={performanceTier}
      />
    </Suspense>
  )
}

function SystemDock({ activeSection, onNavigate, onOpenCommand }) {
  return (
    <nav className="system-dock" aria-label="作品集工作台导航">
      <div className="dock-status" aria-hidden="true">
        <span>PORTFOLIO OS</span>
        <i />
      </div>
      <div className="dock-sections">
        {appSections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          return (
            <button
              type="button"
              className={isActive ? 'is-active' : ''}
              key={section.id}
              onClick={() => onNavigate(section.id)}
              aria-label={`前往${section.label}`}
              aria-current={isActive ? 'location' : undefined}
            >
              <Icon size={17} strokeWidth={1.55} />
              <span>{section.label}</span>
              <small>{section.code}</small>
            </button>
          )
        })}
      </div>
      <button className="dock-command" type="button" onClick={onOpenCommand} aria-label="打开快捷指令">
        <Command size={17} strokeWidth={1.6} />
        <span>指令</span>
        <kbd>⌘K</kbd>
      </button>
    </nav>
  )
}

function ContextRail({ activeSection, scrollProgress, onNavigate }) {
  const currentIndex = Math.max(0, appSections.findIndex((section) => section.id === activeSection))
  const current = appSections[currentIndex]
  const next = appSections[(currentIndex + 1) % appSections.length]

  return (
    <aside className="context-rail" aria-label="当前页面状态">
      <div className="context-rail-progress" aria-hidden="true">
        <span style={{ height: `${scrollProgress}%` }} />
      </div>
      <div className="context-rail-copy">
        <span>ACTIVE / {current.code}</span>
        <strong>{current.label}</strong>
        <small>{Math.round(scrollProgress)}% SCANNED</small>
      </div>
      <button type="button" onClick={() => onNavigate(next.id)}>
        NEXT / {next.label}
        <ArrowDown size={14} />
      </button>
    </aside>
  )
}

function CommandPalette({ open, onClose, onNavigate, onNotify }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = useMemo(() => [
    ...appSections.map((section) => ({
      id: `section-${section.id}`,
      group: 'NAVIGATE',
      label: `前往${section.label}`,
      hint: section.hint,
      code: section.code,
      run: () => onNavigate(section.id),
    })),
    {
      id: 'copy-email',
      group: 'ACTION',
      label: '复制联系邮箱',
      hint: profile.email,
      code: 'CP',
      run: async () => {
        try {
          await navigator.clipboard.writeText(profile.email)
          onNotify('邮箱已复制到剪贴板')
        } catch {
          window.location.href = `mailto:${profile.email}`
        }
      },
    },
    {
      id: 'open-github',
      group: 'ACTION',
      label: '打开 GitHub 主页',
      hint: `@${profile.github.username}`,
      code: 'GH',
      run: () => window.open(profile.github.url, '_blank', 'noopener,noreferrer'),
    },
  ], [onNavigate, onNotify])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredCommands = commands.filter((command) => (
    !normalizedQuery || `${command.label} ${command.hint} ${command.group}`.toLowerCase().includes(normalizedQuery)
  ))

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  const runCommand = async (command) => {
    await command.run()
    onClose()
  }

  const handleKeys = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => (current + 1) % Math.max(filteredCommands.length, 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => (current - 1 + Math.max(filteredCommands.length, 1)) % Math.max(filteredCommands.length, 1))
    }
    if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault()
      runCommand(filteredCommands[selectedIndex])
    }
  }

  return (
    <div className="command-layer" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="快捷指令" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search">
          <Search size={19} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeys}
            placeholder="搜索章节或操作…"
            aria-label="搜索快捷指令"
          />
          <kbd>ESC</kbd>
        </div>

        <div className="command-results">
          {filteredCommands.length > 0 ? filteredCommands.map((command, index) => (
            <button
              type="button"
              className={selectedIndex === index ? 'is-selected' : ''}
              key={command.id}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => runCommand(command)}
            >
              <span className="command-code">{command.code}</span>
              <span>
                <strong>{command.label}</strong>
                <small>{command.hint}</small>
              </span>
              <span className="command-group">{command.group}</span>
              <ArrowRight size={17} />
            </button>
          )) : (
            <div className="command-empty">没有匹配的操作，换个关键词试试</div>
          )}
        </div>

        <footer className="command-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
          <span><kbd>↵</kbd> 打开</span>
          <span>CCW SYSTEM / READY</span>
        </footer>
      </section>
    </div>
  )
}

function ProjectDrawer({ project, onClose, onSelect }) {
  const drawerLayerRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const wasOpenRef = useRef(false)
  const isOpen = Boolean(project)

  useEffect(() => {
    if (isOpen) {
      const activeElement = document.activeElement
      restoreFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null
      wasOpenRef.current = true

      const frameId = window.requestAnimationFrame(() => {
        drawerLayerRef.current?.querySelector('.project-drawer > header button')?.focus({ preventScroll: true })
      })
      return () => window.cancelAnimationFrame(frameId)
    }

    if (!wasOpenRef.current) return undefined
    wasOpenRef.current = false
    const frameId = window.requestAnimationFrame(() => {
      const restoreTarget = restoreFocusRef.current
      if (restoreTarget?.isConnected) restoreTarget.focus({ preventScroll: true })
      restoreFocusRef.current = null
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const drawer = drawerLayerRef.current?.querySelector('.project-drawer')
    const keepFocusInside = (event) => {
      if (event.key !== 'Tab' || !drawer) return

      const focusableElements = [...drawer.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')
      if (focusableElements.length === 0) {
        event.preventDefault()
        drawer.focus({ preventScroll: true })
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement
      if (event.shiftKey && (activeElement === first || !drawer.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !drawer.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    drawer.addEventListener('keydown', keepFocusInside)
    return () => drawer.removeEventListener('keydown', keepFocusInside)
  }, [isOpen])

  if (!project) return null

  const projectIndex = projects.findIndex((item) => item.index === project.index)
  const previous = projects[(projectIndex - 1 + projects.length) % projects.length]
  const next = projects[(projectIndex + 1) % projects.length]
  const isExternal = Boolean(project.href?.startsWith('http'))

  return (
    <div ref={drawerLayerRef} className="project-drawer-layer" role="presentation" onMouseDown={onClose}>
      <aside className="project-drawer" role="dialog" aria-modal="true" aria-label={`${project.title}项目详情`} onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <span>PROJECT INSPECTOR / {project.index}</span>
          <button type="button" onClick={onClose} aria-label="关闭项目详情"><X size={20} /></button>
        </header>

        <div className="project-drawer-visual">
          <img src={project.image} alt={project.imageAlt} decoding="async" />
          <span style={{ background: project.accent }} />
          <strong>{project.index}</strong>
        </div>

        <div className="project-drawer-copy">
          <span>{project.category}</span>
          <h2>{project.title}</h2>
          <small>{project.en}</small>
          <p>{project.description}</p>

          <div className="project-drawer-facts">
            <div><span>STATUS</span><strong>ACTIVE / ITERATING</strong></div>
            <div><span>METHOD</span><strong>BUILD · TEST · REVIEW</strong></div>
          </div>

          <a href={isExternal ? project.href : '#contact'} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined} onClick={isExternal ? undefined : onClose}>
            {isExternal ? '前往 GitHub 查看' : '联系我了解更多'}
            <ArrowUpRight size={18} />
          </a>
        </div>

        <footer>
          <button type="button" onClick={() => onSelect(previous)}><ArrowLeft size={17} /> 上一个</button>
          <span>{String(projectIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => onSelect(next)}>下一个 <ArrowRight size={17} /></button>
        </footer>
      </aside>
    </div>
  )
}

function SystemToast({ message }) {
  return (
    <div className={`system-toast ${message ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <i />
      <span>{message || 'SYSTEM READY'}</span>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  const navigateTo = (sectionId) => {
    const target = document.getElementById(sectionId)
    if (!target) return
    setMenuOpen(false)
    setCommandOpen(false)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const notify = (message) => {
    setToastMessage(message)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToastMessage(''), 2200)
  }

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('.section-reveal').forEach((element) => observer.observe(element))

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.15, 0.4, 0.7] },
    )

    appSections.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) sectionObserver.observe(section)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      sectionObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const overlayOpen = menuOpen || commandOpen || Boolean(selectedProject)
    document.body.classList.toggle('menu-is-open', overlayOpen)
    return () => document.body.classList.remove('menu-is-open')
  }, [menuOpen, commandOpen, selectedProject])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
        return
      }

      if (event.key === 'Escape') {
        setCommandOpen(false)
        setSelectedProject(null)
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  return (
    <ClickSpark sparkColor="#67e7ff" sparkCount={12} sparkRadius={38} sparkSize={14}>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        activeSection={activeSection}
        onOpenCommand={() => setCommandOpen(true)}
      />
      <ContextRail activeSection={activeSection} scrollProgress={scrollProgress} onNavigate={navigateTo} />
      <main>
        <Hero />
        <ScrollVelocity
          texts={['CLAUDE CODE · CODEX · OPENAI · AI AGENTS · LANGCHAIN · ', 'C · C++ · PYTHON · JAVA / LEARNING · BUILD · TEST · ITERATE · ']}
          velocity={62}
          copies={5}
          className="portfolio-velocity-text"
        />
        <About />
        <Experience />
        <Projects onInspect={setSelectedProject} />
        <Strengths />
        <Contact />
      </main>
      <SystemDock activeSection={activeSection} onNavigate={navigateTo} onOpenCommand={() => setCommandOpen(true)} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onNavigate={navigateTo} onNotify={notify} />
      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} onSelect={setSelectedProject} />
      <SystemToast message={toastMessage} />
    </ClickSpark>
  )
}

function useLayerIntro(rootRef, selectors) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      selectors.forEach(({ target, from, at = '<0.1', duration = 0.72, stagger = 0 }) => {
        const targets = gsap.utils.toArray(target, root)
        if (!targets.length) return
        timeline.from(targets, { ...from, duration, stagger, clearProps: 'transform,opacity,filter' }, at)
      })
    }, root)

    return () => context.revert()
  }, [rootRef, selectors])
}

function usePerformanceTier() {
  const [tier, setTier] = useState('balanced')

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')

    const detectTier = () => {
      const connection = navigator.connection
      const memory = Number(navigator.deviceMemory || 0)
      const cores = Number(navigator.hardwareConcurrency || 0)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelBudget = window.innerWidth * window.innerHeight * dpr * dpr

      if (
        reducedMotionQuery.matches
        || Boolean(connection?.saveData)
        || coarsePointerQuery.matches
        || (memory > 0 && memory <= 4)
        || (cores > 0 && cores <= 4)
        || pixelBudget > 7_000_000
      ) {
        setTier('minimal')
        return
      }

      // Browsers that hide deviceMemory (for example Firefox and privacy modes)
      // stay balanced instead of being mistaken for a high-end device.
      if (memory >= 8 && cores >= 8 && pixelBudget <= 4_500_000) {
        setTier('enhanced')
        return
      }

      setTier('balanced')
    }

    detectTier()
    reducedMotionQuery.addEventListener?.('change', detectTier)
    coarsePointerQuery.addEventListener?.('change', detectTier)
    window.addEventListener('resize', detectTier, { passive: true })

    return () => {
      reducedMotionQuery.removeEventListener?.('change', detectTier)
      coarsePointerQuery.removeEventListener?.('change', detectTier)
      window.removeEventListener('resize', detectTier)
    }
  }, [])

  return tier
}

function LayerBrand({ tone = 'dark' }) {
  return (
    <div className={`layer-brand is-${tone}`} aria-label="蔡辰玮个人博客">
      <span className="layer-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 256 256" role="img">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
          <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
      </span>
      <span className="layer-brand-copy">
        <b>CAI CHENWEI</b>
        <small>PORTFOLIO / 2026</small>
      </span>
    </div>
  )
}

function WelcomeLayer({ onEnter, performanceTier }) {
  const rootRef = useRef(null)
  const [visualMode, setVisualMode] = useState('pending')
  const introSteps = useMemo(() => [
    { target: '.welcome-topline', from: { y: -24, opacity: 0, filter: 'blur(10px)' }, at: 0.08, duration: 0.8 },
    { target: '.welcome-beams', from: { opacity: 0, scale: 1.04 }, at: 0.1, duration: 1.25 },
    { target: '.welcome-kinetic', from: { opacity: 0, scale: 0.94, filter: 'blur(14px)' }, at: 0.12, duration: 1.15 },
    { target: '.welcome-kicker', from: { y: 18, opacity: 0 }, at: 0.18, duration: 0.55 },
    { target: '.welcome-title-line', from: { yPercent: 115, rotate: 1.5, opacity: 0 }, at: 0.22, duration: 0.92, stagger: 0.12 },
    { target: '.welcome-title-english', from: { y: 14, opacity: 0 }, at: 0.56, duration: 0.62 },
    { target: '.welcome-enter-wrap', from: { y: 20, opacity: 0, scale: 0.96 }, at: 0.74, duration: 0.68 },
    { target: '.welcome-directory-item', from: { x: 28, opacity: 0 }, at: 0.58, duration: 0.7, stagger: 0.1 },
    { target: '.welcome-explore-cue', from: { y: 14, opacity: 0 }, at: 0.9, duration: 0.62 },
  ], [])
  useLayerIntro(rootRef, introSteps)

  useEffect(() => {
    if (performanceTier === 'minimal') {
      setVisualMode('static')
      return undefined
    }

    // One WebGL scene is the visual ceiling here. Running Beams and KineticIris
    // together caused shader compilation spikes and persistent GPU contention.
    const activateVisuals = () => setVisualMode('iris')
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(activateVisuals, { timeout: 900 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timerId = window.setTimeout(activateVisuals, 420)
    return () => window.clearTimeout(timerId)
  }, [performanceTier])

  return (
    <section className="welcome-layer" aria-labelledby="welcome-title" ref={rootRef}>
      <div className="welcome-surface" aria-hidden="true" />
      <div className="welcome-beams">
        <div className="welcome-beams-fallback" aria-hidden="true" />
      </div>
      <div className="welcome-kinetic">
        {visualMode === 'iris' ? (
          <Suspense fallback={<div className="welcome-kinetic-fallback" aria-hidden="true" />}>
            <KineticIris variant="full" />
          </Suspense>
        ) : <div className="welcome-kinetic-fallback" aria-hidden="true" />}
      </div>
      <header className="welcome-header">
        <div className="welcome-topline">
          <LayerBrand tone="light" />
          <span className="welcome-system-status">
            <i />
            <span className="welcome-system-status-copy"><b>AVAILABLE</b><small>可联系</small></span>
          </span>
        </div>
      </header>
      <nav className="welcome-directory" aria-label="主页纵向目录">
        <div className="welcome-directory-heading" aria-hidden="true"><span>INDEX</span><i>/</i><b>目录</b></div>
        <div className="welcome-directory-list">
          <button type="button" className="welcome-directory-item is-active" onClick={onEnter} aria-current="page">
            <span className="welcome-directory-number">01</span>
            <span className="welcome-directory-copy">
              <strong>个人档案</strong>
              <ShinyText
                className="welcome-directory-english"
                text="PROFILE"
                color="rgba(24, 31, 33, 0.58)"
                shineColor="#9fcfd2"
                speed={3.8}
                delay={1.6}
                spread={110}
              />
            </span>
          </button>
          <a className="welcome-directory-item" href={profile.github.url} target="_blank" rel="noreferrer">
            <span className="welcome-directory-number">02</span>
            <span className="welcome-directory-copy"><strong>开源项目</strong><small>OPEN SOURCE</small></span>
          </a>
          <a className="welcome-directory-item" href={`mailto:${profile.email}`}>
            <span className="welcome-directory-number">03</span>
            <span className="welcome-directory-copy"><strong>联系</strong><small>CONTACT</small></span>
          </a>
        </div>
        <span className="welcome-directory-progress" aria-hidden="true">01 / 03</span>
      </nav>
      <div className="welcome-copy">
        <span className="welcome-kicker">CAI CHENWEI / PERSONAL PORTFOLIO</span>
        <h1 id="welcome-title" data-layer-focus="welcome" tabIndex={-1}>
          <span className="welcome-title-mask">
            <span className="welcome-title-line">
              <ShinyText text="想认识" color="#17191b" shineColor="#465457" speed={4.6} delay={1.5} spread={106} />
            </span>
          </span>
          <span className="welcome-title-mask">
            <span className="welcome-title-line">
              <ShinyText text="我吗？" color="#17191b" shineColor="#465457" speed={4.6} delay={1.5} spread={106} />
            </span>
          </span>
        </h1>
        <ShinyText
          className="welcome-title-english"
          text="WANT TO KNOW ME?"
          color="rgba(23, 29, 31, 0.78)"
          shineColor="#a9c5c7"
          speed={4.2}
          delay={1.8}
          spread={112}
        />
        <div className="welcome-enter-wrap">
          <button type="button" className="welcome-enter" onClick={onEnter}>
            <span className="welcome-enter-copy">
              <strong>进入我的世界</strong>
              <ShinyText
                text="ENTER MY WORLD"
                color="rgba(25, 31, 33, 0.48)"
                shineColor="#8ebfc3"
                speed={4.4}
                delay={2.2}
                spread={116}
              />
            </span>
            <span className="welcome-enter-icon"><ArrowRight size={21} strokeWidth={1.45} /></span>
          </button>
        </div>
      </div>
      <button type="button" className="welcome-explore-cue" onClick={onEnter}>
        <span aria-hidden="true" />
        <b><span>点击进入 · 开始探索</span><small>CLICK TO ENTER · START EXPLORING</small></b>
        <ArrowDown size={17} strokeWidth={1.45} />
      </button>
    </section>
  )
}

function DirectoryLayer({ onBack, onSelect, performanceTier }) {
  const rootRef = useRef(null)
  const introSteps = useMemo(() => [
    { target: '.layer-nav-shell', from: { y: -22, opacity: 0, filter: 'blur(8px)' }, at: 0.08, duration: 0.75 },
    { target: '.directory-heading > *', from: { y: 15, opacity: 0 }, at: 0.18, duration: 0.65, stagger: 0.08 },
    { target: '.directory-menu', from: { opacity: 0, scale: 0.92, filter: 'blur(14px)' }, at: 0.18, duration: 1.1 },
    { target: '.directory-manifesto', from: { y: 32, opacity: 0, scale: 0.97 }, at: 0.62, duration: 0.8 },
    { target: '.directory-hint', from: { opacity: 0 }, at: 0.82, duration: 0.6 },
  ], [])
  useLayerIntro(rootRef, introSteps)

  return (
    <section className="directory-layer" aria-labelledby="directory-title" ref={rootRef}>
      <div className="directory-chrome" aria-hidden="true">
        {performanceTier === 'minimal' ? (
          <div className="directory-chrome-fallback" />
        ) : (
          <Suspense fallback={<div className="directory-chrome-fallback" />}>
            <LiquidChrome
              baseColor={[0.34, 0.42, 0.44]}
              speed={0.1}
              amplitude={0.085}
              frequencyX={1.25}
              frequencyY={1.6}
              interactive={performanceTier === 'enhanced'}
              maxDpr={performanceTier === 'enhanced' ? 1.25 : 1.08}
              maxFps={performanceTier === 'enhanced' ? 30 : 24}
            />
          </Suspense>
        )}
      </div>

      <header className="directory-header">
        <div className="layer-nav-shell">
          <LayerBrand />
          <div className="directory-heading" data-layer-focus="directory" tabIndex={-1}>
            <span>PERSONAL DIRECTORY</span>
            <h1 id="directory-title">你想从哪里开始？</h1>
          </div>
          <button type="button" className="layer-back-button" onClick={onBack}>
            <ArrowLeft size={17} /> 返回
          </button>
        </div>
      </header>

      <div className="directory-menu">
        <VerticalCylinderMenu items={portfolioDirectory} onSelect={onSelect} />
      </div>

      <div className="directory-manifesto">
        <Suspense fallback={<h2>从你感兴趣的地方开始。</h2>}>
          <MaskedHeading
            text="从你感兴趣的地方开始。"
            src="/assets/directory-projects-v2.webp"
            fillScale={1.38}
            parallax={18}
            drift={8}
            brightness={1.06}
            saturation={0.9}
            reveal="wipe"
            duration={1.25}
            trigger="mount"
            align="left"
            weight={700}
            tracking={-0.055}
            lineHeight={0.96}
            textScale={0.064}
          />
        </Suspense>
        <p><span>READ IN YOUR OWN ORDER</span>无需按顺序阅读，选择此刻最想了解的一面。</p>
      </div>
      <p className="directory-hint">上下拖动或滚动目录，点击中央卡片进入</p>
    </section>
  )
}

function ContentLayer({
  activePanel,
  activeContactId,
  onSelectPanel,
  onSelectContact,
  onBackContact,
  onDirectory,
  onInspect,
  performanceTier,
}) {
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const introSteps = useMemo(() => [
    { target: '.content-layer-header', from: { y: -24, opacity: 0, filter: 'blur(8px)' }, at: 0.05, duration: 0.78 },
  ], [])
  useLayerIntro(rootRef, introSteps)

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    const root = rootRef.current
    const scroller = scrollRef.current
    if (!root || !scroller) return undefined

    scroller.querySelectorAll('.section-reveal').forEach((element) => element.classList.add('is-visible'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      const targets = scroller.querySelectorAll(
        '.section-eyebrow, .about-head, .profile-layout, .section-title-row, .journey-workspace, .projects-heading, .project-flow-index, .project-list, .github-showcase, .strengths-heading, .strength-grid',
      )
      if (!targets.length) return
      gsap.from(targets, {
        y: 34,
        opacity: 0,
        filter: 'blur(9px)',
        duration: 0.78,
        stagger: 0.075,
        ease: 'power3.out',
        clearProps: 'transform,opacity,filter',
      })
    }, root)

    return () => context.revert()
  }, [activeContactId, activePanel])

  return (
    <section className="content-layer" aria-label="个人内容" ref={rootRef}>
      <header className="content-layer-header" data-layer-focus="content" tabIndex={-1}>
        <button type="button" className="content-directory-button" onClick={onDirectory}>
          <ArrowLeft size={17} /> 目录
        </button>
        <LayerBrand tone="light" />
        <nav className="content-tabs" aria-label="内容板块">
          {portfolioDirectory.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activePanel === item.id ? 'is-active' : ''}
              aria-current={activePanel === item.id ? 'page' : undefined}
              onClick={() => onSelectPanel(item)}
            >
              <span>{item.code}</span>{item.title}
            </button>
          ))}
        </nav>
      </header>

      <div className="content-layer-scroll" ref={scrollRef}>
        {activePanel === 'about' && <About />}
        {activePanel === 'experience' && <Experience />}
        {activePanel === 'projects' && <Projects onInspect={onInspect} />}
        {activePanel === 'strengths' && <Strengths />}
        {activePanel === 'contact' && (
          <Contact
            activeChannelId={activeContactId}
            onSelectChannel={onSelectContact}
            onBackChannel={onBackContact}
            performanceTier={performanceTier}
          />
        )}
      </div>
    </section>
  )
}

function LayeredApp() {
  const [view, setView] = useState('welcome')
  const [activePanel, setActivePanel] = useState('about')
  const [activeContactId, setActiveContactId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const transitionRef = useRef(null)
  const transitionLockRef = useRef(false)
  const performanceTier = usePerformanceTier()

  const focusLayer = (nextView, panelId) => {
    window.requestAnimationFrame(() => {
      const focusTarget = nextView === 'content' && (panelId ?? activePanel) === 'contact'
        ? 'contact'
        : nextView
      document.querySelector(`[data-layer-focus="${focusTarget}"]`)?.focus({ preventScroll: true })
    })
  }

  const transitionTo = (nextView, item) => {
    if (transitionLockRef.current) return
    if (nextView === 'content' && view === 'content') {
      if (item) {
        setActivePanel(item.id)
        setActiveContactId(null)
        focusLayer(nextView, item.id)
      }
      return
    }

    const overlay = transitionRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!overlay || reduceMotion) {
      if (item) setActivePanel(item.id)
      if (item || nextView !== 'content') setActiveContactId(null)
      setView(nextView)
      focusLayer(nextView, item?.id)
      return
    }

    transitionLockRef.current = true
    gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: () => {
        transitionLockRef.current = false
        focusLayer(nextView, item?.id)
      },
    })
      .set(overlay, { clipPath: 'inset(0 100% 0 0)', pointerEvents: 'auto' })
      .to(overlay, { clipPath: 'inset(0 0% 0 0)', duration: 0.46 })
      .add(() => {
        if (item) setActivePanel(item.id)
        if (item || nextView !== 'content') setActiveContactId(null)
        setView(nextView)
      })
      .to(overlay, { clipPath: 'inset(0 0 0 100%)', duration: 0.58, delay: 0.06 })
      .set(overlay, { pointerEvents: 'none' })
  }

  const openPanel = (item) => transitionTo('content', item)
  const usesLightCrosshair = view === 'welcome'
    || (view === 'content' && ['about', 'experience', 'strengths'].includes(activePanel))

  useEffect(() => {
    document.body.classList.add('layered-app-active')
    return () => document.body.classList.remove('layered-app-active')
  }, [])

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (!themeColor) return
    const isLightContent = view === 'content'
      && ['about', 'experience', 'strengths'].includes(activePanel)
    themeColor.setAttribute(
      'content',
      view === 'welcome' || isLightContent ? '#edf0ed' : '#0d1517',
    )
  }, [activePanel, view])

  useEffect(() => {
    const modalOpen = Boolean(selectedProject)
    const activeLayer = document.querySelector('.welcome-layer, .directory-layer, .content-layer')
    document.body.classList.toggle('menu-is-open', modalOpen)
    if (activeLayer) {
      activeLayer.inert = modalOpen
      if (modalOpen) activeLayer.setAttribute('aria-hidden', 'true')
      else activeLayer.removeAttribute('aria-hidden')
    }

    return () => {
      document.body.classList.remove('menu-is-open')
      if (!activeLayer) return
      activeLayer.inert = false
      activeLayer.removeAttribute('aria-hidden')
    }
  }, [selectedProject])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (selectedProject) {
        setSelectedProject(null)
      } else if (activeContactId) {
        setActiveContactId(null)
      } else if (view === 'content') {
        transitionTo('directory')
      } else if (view === 'directory') {
        transitionTo('welcome')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeContactId, selectedProject, view])

  return (
    <ClickSpark sparkColor="#67e7ff" sparkCount={10} sparkRadius={34} sparkSize={12}>
      <div className={`layered-portfolio view-${view}`} data-performance-tier={performanceTier}>
        {performanceTier !== 'minimal' ? (
          <Suspense fallback={null}>
            <Crosshair
              color={usesLightCrosshair ? 'rgba(18, 25, 27, 0.72)' : 'rgba(103, 231, 255, 0.62)'}
              blendMode={usesLightCrosshair ? 'multiply' : 'screen'}
            />
          </Suspense>
        ) : null}
        {view === 'welcome' && <WelcomeLayer onEnter={() => transitionTo('directory')} performanceTier={performanceTier} />}
        {view === 'directory' && (
          <DirectoryLayer
            onBack={() => transitionTo('welcome')}
            onSelect={openPanel}
            performanceTier={performanceTier}
          />
        )}
        {view === 'content' && (
          <ContentLayer
            activePanel={activePanel}
            activeContactId={activeContactId}
            onSelectPanel={openPanel}
            onSelectContact={setActiveContactId}
            onBackContact={() => setActiveContactId(null)}
            onDirectory={() => transitionTo('directory')}
            onInspect={setSelectedProject}
            performanceTier={performanceTier}
          />
        )}
        <div className="layer-transition" ref={transitionRef} aria-hidden="true">
          <span>CCW</span>
          <small>PORTFOLIO / INDEXING</small>
        </div>
        <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} onSelect={setSelectedProject} />
      </div>
    </ClickSpark>
  )
}

export default LayeredApp
