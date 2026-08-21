import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, Copy, ShieldCheck } from 'lucide-react'
import { contactChannels } from '../../data'
import InfiniteMenu from '../InfiniteMenu/InfiniteMenu'
import './ContactHub.css'

const channelById = new Map(contactChannels.map((channel) => [channel.id, channel]))

function ContactGlyph({ channel }) {
  const glyphs = {
    qq: 'Q',
    wechat: '微',
    dingtalk: '钉',
    bilibili: 'B',
  }

  return (
    <span className="contact-channel-glyph" aria-hidden="true">
      {glyphs[channel.id] ?? channel.title.slice(0, 1)}
    </span>
  )
}

function ContactDetailCard({ index, title, children }) {
  return (
    <article className="contact-detail-card">
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  )
}

async function copyText(value) {
  if (!value) return false

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // 非 HTTPS 环境可能禁用 Clipboard API，继续使用兼容复制方案。
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  textArea.style.pointerEvents = 'none'
  document.body.appendChild(textArea)
  textArea.select()

  let didCopy = false
  try {
    didCopy = document.execCommand('copy')
  } catch {
    didCopy = false
  } finally {
    document.body.removeChild(textArea)
  }
  return didCopy
}

export default function ContactHub({ activeChannelId, onSelectChannel, onBackChannel, performanceTier = 'balanced' }) {
  const activeChannel = channelById.get(activeChannelId) ?? null
  const activeChannelIndex = activeChannel
    ? Math.max(0, contactChannels.findIndex((channel) => channel.id === activeChannel.id))
    : 0
  const [previewIndex, setPreviewIndex] = useState(activeChannelIndex)
  const [copyStatus, setCopyStatus] = useState('')
  const overviewHeadingRef = useRef(null)
  const detailHeadingRef = useRef(null)
  const lastSelectedIdRef = useRef(activeChannel?.id ?? null)
  const copyTimerRef = useRef(null)

  const menuItems = useMemo(
    () => contactChannels.map((channel) => ({
      id: channel.id,
      image: channel.image,
      title: channel.title,
      description: channel.menuDescription,
    })),
    [],
  )

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (activeChannel) {
        detailHeadingRef.current?.focus({ preventScroll: true })
        return
      }

      const lastButton = lastSelectedIdRef.current
        ? document.querySelector(`[data-contact-channel="${lastSelectedIdRef.current}"]`)
        : null
      ;(lastButton ?? overviewHeadingRef.current)?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeChannel])

  const selectChannel = useCallback((channel) => {
    if (!channel) return
    const index = contactChannels.findIndex((item) => item.id === channel.id)
    lastSelectedIdRef.current = channel.id
    if (index >= 0) setPreviewIndex(index)
    setCopyStatus('')
    onSelectChannel(channel.id)
  }, [onSelectChannel])

  const handleMenuSelect = useCallback((item) => {
    selectChannel(channelById.get(item.id))
  }, [selectChannel])

  const handleActiveItemChange = useCallback((item, index) => {
    if (!item) return
    setPreviewIndex((current) => (current === index ? current : index))
  }, [])

  const handleBack = useCallback(() => {
    if (activeChannel) lastSelectedIdRef.current = activeChannel.id
    setCopyStatus('')
    onBackChannel()
  }, [activeChannel, onBackChannel])

  const handleCopy = useCallback(async () => {
    if (!activeChannel?.copyValue) return
    const didCopy = await copyText(activeChannel.copyValue)
    setCopyStatus(didCopy ? `已复制${activeChannel.handleLabel}` : '复制失败，请手动选择账号')
    window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopyStatus(''), 2200)
  }, [activeChannel])

  if (activeChannel) {
    return (
      <section
        className="contact contact-hub contact-hub-detail"
        id="contact"
        style={{ '--channel-accent': activeChannel.accent }}
      >
        <div className="contact-grid" aria-hidden="true" />
        <div className="contact-hub-lightfield" aria-hidden="true" />
        <div className="contact-orb orb-one" aria-hidden="true" />
        <div className="contact-orb orb-two" aria-hidden="true" />

        <div className="contact-inner contact-detail-inner contact-hub-reveal">
          <button type="button" className="contact-detail-back" onClick={handleBack}>
            <ArrowLeft size={18} strokeWidth={1.6} />
            返回联系方式
          </button>

          <div className="contact-detail-layout">
            <div className="contact-detail-copy">
              <div className="contact-detail-eyebrow">
                <span>{activeChannel.code}</span>
                <span>{activeChannel.platform}</span>
                <span className={`is-${activeChannel.status}`}>{activeChannel.statusLabel}</span>
              </div>

              <h1 ref={detailHeadingRef} tabIndex={-1} data-layer-focus="contact">{activeChannel.title}</h1>
              <p className="contact-detail-summary">{activeChannel.summary}</p>

              <div className={`contact-account-panel is-${activeChannel.status}`}>
                <div>
                  <span>{activeChannel.handleLabel}</span>
                  <strong>{activeChannel.handle}</strong>
                </div>
                <span className="contact-account-status">
                  <i />
                  {activeChannel.statusLabel}
                </span>
              </div>

              <div className="contact-detail-actions">
                {activeChannel.copyValue ? (
                  <button type="button" className="contact-primary-action" onClick={handleCopy}>
                    {copyStatus.startsWith('已复制') ? <Check size={18} /> : <Copy size={18} />}
                    {copyStatus.startsWith('已复制') ? copyStatus : `复制${activeChannel.handleLabel}`}
                  </button>
                ) : (
                  <span className="contact-pending-action">公开账号确认后开放复制入口</span>
                )}

                {activeChannel.externalUrl ? (
                  <a href={activeChannel.externalUrl} target="_blank" rel="noreferrer" className="contact-secondary-action">
                    打开公开主页
                    <ArrowUpRight size={18} />
                    <span className="sr-only">，将在新标签页打开</span>
                  </a>
                ) : null}
              </div>
              <p className="contact-copy-status" aria-live="polite">{copyStatus}</p>
            </div>

            <div
              className={`contact-detail-visual ${activeChannel.qrImage ? 'has-qr' : ''}`}
              aria-hidden={activeChannel.qrImage ? undefined : true}
            >
              <img className="contact-detail-visual-image" src={activeChannel.image} alt="" aria-hidden="true" />
              <div className="contact-detail-visual-shade" aria-hidden="true" />
              {activeChannel.qrImage ? (
                <figure className="contact-detail-qr-card">
                  <img
                    className="contact-detail-qr-image"
                    src={activeChannel.qrImage}
                    alt="蔡辰玮的钉钉个人二维码"
                  />
                  <figcaption>使用钉钉扫描添加</figcaption>
                </figure>
              ) : (
                <ContactGlyph channel={activeChannel} />
              )}
              <span className="contact-detail-visual-code">{activeChannel.code} / {activeChannel.platform}</span>
              <span className="contact-detail-visual-signal">CONTACT SIGNAL</span>
            </div>
          </div>

          <div className="contact-detail-cards">
            <ContactDetailCard index="01" title="适合联系的事情">
              {activeChannel.purposes.join('、')}。
            </ContactDetailCard>
            <ContactDetailCard index="02" title="添加与备注">
              {activeChannel.note}
            </ContactDetailCard>
            <ContactDetailCard index="03" title="回复方式">
              {activeChannel.response}
            </ContactDetailCard>
          </div>

          <div className="contact-privacy-note">
            <ShieldCheck size={18} strokeWidth={1.6} />
            <p><span>PRIVACY NOTE</span>请勿通过公开渠道发送密码、验证码、证件或其他敏感信息。</p>
          </div>
        </div>
      </section>
    )
  }

  const previewChannel = contactChannels[previewIndex] ?? contactChannels[0]

  return (
    <section className="contact contact-hub contact-hub-overview" id="contact">
      <div className="contact-grid" aria-hidden="true" />
      <div className="contact-hub-lightfield" aria-hidden="true" />
      <div className="contact-orb orb-one" aria-hidden="true" />
      <div className="contact-orb orb-two" aria-hidden="true" />

      <div className="contact-inner contact-hub-shell contact-hub-reveal">
        <header className="contact-hub-header">
          <div>
            <span>CONTACT ARCHIVE / 05</span>
            <h1 ref={overviewHeadingRef} tabIndex={-1} data-layer-focus="contact">从哪里<br />与我联系？</h1>
          </div>
          <p>四种通道，各有清晰的用途与边界。选择一个平台，进入对应的联系信息页。</p>
        </header>

        <div className="contact-hub-menu-frame">
          <nav className="contact-hub-channel-nav" aria-label="联系方式">
            {contactChannels.map((channel, index) => (
              <button
                type="button"
                key={channel.id}
                data-contact-channel={channel.id}
                className={previewIndex === index ? 'is-active' : ''}
                aria-current={previewIndex === index ? 'true' : undefined}
                onPointerEnter={() => setPreviewIndex(index)}
                onFocus={() => setPreviewIndex(index)}
                onClick={() => selectChannel(channel)}
              >
                <span>{channel.code}</span>
                <b>{channel.title}</b>
                <i className={`is-${channel.status}`} aria-label={channel.statusLabel} />
              </button>
            ))}
          </nav>

          <InfiniteMenu
            items={menuItems}
            activeIndex={previewIndex}
            onActiveItemChange={handleActiveItemChange}
            onSelect={handleMenuSelect}
            actionLabel="打开联系页"
            ariaLabel="四种联系方式的球形切换菜单"
            className="contact-infinite-menu"
            scale={0.92}
            forceFallback={performanceTier !== 'enhanced'}
            maxDpr={performanceTier === 'enhanced' ? 1.35 : 1.1}
          />

          <div className="contact-hub-readout">
            <span>ACTIVE / {previewChannel.code}</span>
            <strong>{previewChannel.status !== 'pending' ? previewChannel.handle : previewChannel.statusLabel}</strong>
          </div>
        </div>

        <footer className="contact-hub-footer">
          <span>拖动球体或使用方向键切换</span>
          <span>点击上方平台可直接进入</span>
          <span>04 CHANNELS / PERSONAL CONTACT</span>
        </footer>
      </div>
    </section>
  )
}
