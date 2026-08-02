import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  GitBranch,
  GitFork,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  X,
} from 'lucide-react'
import { experiences, githubRepositories, metrics, profile, projects, strengths } from './data'
import BlurText from './components/BlurText/BlurText'
import ClickSpark from './components/ClickSpark/ClickSpark'
import DecryptedText from './components/DecryptedText/DecryptedText'
import GlareHover from './components/GlareHover/GlareHover'
import Magnet from './components/Magnet/Magnet'
import RotatingText from './components/RotatingText/RotatingText'
import ScrollFloat from './components/ScrollFloat/ScrollFloat'
import ScrollStack from './components/ScrollStack/ScrollStack'
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity'
import ShinyText from './components/ShinyText/ShinyText'
import SpotlightCard from './components/SpotlightCard/SpotlightCard'
import TiltedCard from './components/TiltedCard/TiltedCard'

const Aurora = lazy(() => import('./components/Aurora/Aurora'))
const Crosshair = lazy(() => import('./components/Crosshair/Crosshair'))
const FlowingMenu = lazy(() => import('./components/FlowingMenu/FlowingMenu'))
const ScrollReveal = lazy(() => import('./components/ScrollReveal/ScrollReveal'))
const SpecularButton = lazy(() => import('./components/SpecularButton/SpecularButton'))

const navItems = [
  { label: '关于', href: '#about' },
  { label: '经历', href: '#experience' },
  { label: '项目', href: '#projects' },
  { label: '能力', href: '#strengths' },
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

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
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
          <a href={item.href} key={item.href}>
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="header-contact" href="#contact">
        <span className="availability-dot" />
        联系我
        <ArrowDownRight size={15} strokeWidth={1.7} />
      </a>

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

  return (
    <section className="hero" id="home">
      <div className="hero-media" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2000&q=85"
        >
          <source
            src="https://videos.pexels.com/video-files/3129595/3129595-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-aurora">
        <Suspense fallback={null}>
          <Aurora colorStops={['#67e7ff', '#183942', '#d9e4e5']} amplitude={0.92} blend={0.58} speed={0.64} />
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
    </section>
  )
}

function About() {
  const portrait = (
    <figure className="portrait-card">
      <img
        src="/profile-placeholder.svg"
        alt="蔡辰玮个人形象占位图，后续可替换为本人照片"
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
  const experienceCards = experiences.map((item, index) => (
    <article className="experience-item" key={item.period}>
      <span className="experience-index">0{index + 1}</span>
      <time>{item.period}</time>
      <div>
        <h3>{item.title}</h3>
        <span className="experience-meta">{item.meta}</span>
      </div>
      <p>{item.text}</p>
      <ArrowUpRight className="experience-arrow" size={24} strokeWidth={1.3} />
    </article>
  ))

  return (
    <section className="experience section-pad" id="experience">
      <SectionEyebrow index="02">JOURNEY / 个人经历</SectionEyebrow>

      <div className="section-title-row section-reveal">
        <ScrollFloat as="h2" className="experience-float-title">
          {'我的路径不是直线，\n但每一步都有迹可循。'}
        </ScrollFloat>
        <p>从班级管理到教育实践，再到技术探索，我在真实问题中持续训练自己的工作方法。</p>
      </div>

      <ScrollStack className="experience-list">{experienceCards}</ScrollStack>
    </section>
  )
}

function ProjectCard({ project, index }) {
  const projectHref = project.href || '#contact'
  const isExternal = projectHref.startsWith('http')

  return (
    <article
      className={`project-card project-card-${index + 1} section-reveal`}
      id={`project-${project.index}`}
      style={{ '--accent': project.accent }}
    >
      <GlareHover className="project-visual" glareColor={project.accent} glareOpacity={0.22} duration={920}>
        <img src={project.image} alt={project.imageAlt} loading="lazy" />
        <div className="project-tint" />
        <div className="project-corner">
          <span style={{ backgroundColor: project.accent }} />
          FEATURED / {project.index}
        </div>
        <a
          href={projectHref}
          className="project-open"
          aria-label={isExternal ? `在 GitHub 查看${project.title}` : `咨询${project.title}项目`}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
        >
          <ArrowUpRight size={26} strokeWidth={1.3} />
        </a>
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
            <img src={profile.github.avatar} alt={`${profile.github.username} 的 GitHub 头像`} loading="lazy" />
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

function Projects() {
  const projectsRef = useRef(null)
  const flowingItems = projects.map((project) => ({
    link: `#project-${project.index}`,
    text: `${project.index} / ${project.title}`,
    image: project.image,
  }))

  return (
    <section className="projects section-pad" id="projects" ref={projectsRef}>
      <Suspense fallback={null}>
        <Crosshair containerRef={projectsRef} color="rgba(103, 231, 255, 0.7)" />
      </Suspense>
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
          <ProjectCard project={project} index={index} key={project.title} />
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

function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    let didCopy = false

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email)
        didCopy = true
      }
    } catch {
      // 部分浏览器会在非 HTTPS 环境禁用 Clipboard API，下面提供兼容回退。
    }

    if (!didCopy) {
      const textArea = document.createElement('textarea')
      textArea.value = profile.email
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      didCopy = document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    if (didCopy) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } else {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-aurora" aria-hidden="true">
        <Suspense fallback={null}>
          <Aurora colorStops={['#ff6859', '#67e7ff', '#213a42']} amplitude={0.72} blend={0.68} speed={0.42} />
        </Suspense>
      </div>
      <div className="contact-grid" aria-hidden="true" />
      <div className="contact-orb orb-one" aria-hidden="true" />
      <div className="contact-orb orb-two" aria-hidden="true" />

      <div className="contact-inner section-reveal">
        <SectionEyebrow index="05" light>LET'S CONNECT / 保持联系</SectionEyebrow>

        <div className="contact-status">
          <span className="availability-dot" />
          <ShinyText text="目前开放实习、合作与有趣的交流" color="rgba(255,255,255,0.5)" shineColor="#67e7ff" speed={4.6} />
        </div>

        <h2>
          有想法？
          <br />
          <span>一起让它发生。</span>
        </h2>

        <div className="contact-actions">
          <Magnet className="contact-email-magnet" padding={70} strength={5}>
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email}
              <ArrowUpRight size={28} strokeWidth={1.4} />
            </a>
          </Magnet>
          <Suspense
            fallback={(
              <button className="copy-button" type="button" onClick={copyEmail}>
                <Copy size={18} />复制邮箱
              </button>
            )}
          >
            <SpecularButton
              size="md"
              radius={2}
              tint="#67e7ff"
              tintOpacity={0.02}
              blur={12}
              textColor="#f5f5ef"
              lineColor="#67e7ff"
              baseColor="#455257"
              intensity={1.25}
              shineSize={13}
              shineFade={38}
              thickness={1.15}
              followMouse
              proximity={220}
              onClick={copyEmail}
              className="copy-specular"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? '已复制邮箱' : '复制邮箱'}
            </SpecularButton>
          </Suspense>
        </div>

        <div className="contact-meta">
          <div><MapPin size={16} /> {profile.location}</div>
          <div><Mail size={16} /> {profile.email}</div>
          <div><Phone size={16} /> {profile.phone}</div>
          <div>QQ · {profile.qq}</div>
          <a href={profile.github.url} target="_blank" rel="noreferrer"><GitBranch size={16} /> @{profile.github.username}</a>
        </div>
      </div>

      <footer className="site-footer">
        <span>© 2026 {profile.nameEn}. ALL RIGHTS RESERVED.</span>
        <a href="https://deerflow.tech" target="_blank" rel="noreferrer">
          Created By Deerflow
        </a>
        <a href="#home">BACK TO TOP ↑</a>
      </footer>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

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
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen)
    return () => document.body.classList.remove('menu-is-open')
  }, [menuOpen])

  return (
    <ClickSpark sparkColor="#67e7ff" sparkCount={12} sparkRadius={38} sparkSize={14}>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
        <Projects />
        <Strengths />
        <Contact />
      </main>
    </ClickSpark>
  )
}

export default App
