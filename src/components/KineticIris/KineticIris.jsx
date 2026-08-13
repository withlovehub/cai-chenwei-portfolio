import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './KineticIris.css'

const clampDpr = (lowPower) => Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.65)

const makeHaloTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) return null

  const gradient = context.createRadialGradient(128, 128, 5, 128, 128, 126)
  gradient.addColorStop(0, 'rgba(130, 219, 225, 0.24)')
  gradient.addColorStop(0.28, 'rgba(214, 241, 241, 0.15)')
  gradient.addColorStop(0.66, 'rgba(222, 215, 198, 0.06)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function KineticIris({ variant = 'right', onActivate, ariaLabel = '进入个人档案' }) {
  const mountRef = useRef(null)
  const pulseRef = useRef(() => {})
  const onActivateRef = useRef(onActivate)
  const side = variant === 'full' ? 'full' : variant === 'left' ? 'left' : 'right'

  useEffect(() => {
    onActivateRef.current = onActivate
  }, [onActivate])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    const memory = Number(navigator.deviceMemory || 8)
    const lowPower = Boolean(navigator.connection?.saveData) || memory < 6 || coarseQuery.matches
    const direction = side === 'left' ? -1 : 1
    let reducedMotion = motionQuery.matches
    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowPower,
        powerPreference: 'high-performance',
      })
    } catch {
      mount.dataset.fallback = 'true'
      return undefined
    }

    renderer.setClearColor(0xffffff, 0)
    renderer.setPixelRatio(clampDpr(lowPower))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 60)
    camera.position.set(0, 0, 9.2)

    const field = new THREE.Group()
    const sculpture = new THREE.Group()
    const orbitSystem = new THREE.Group()
    field.add(sculpture, orbitSystem)
    scene.add(field)

    const pearlMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f3ed,
      emissive: 0xffffff,
      emissiveIntensity: 0.065,
      metalness: 0.03,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.11,
      sheen: 0.7,
      sheenColor: new THREE.Color(0xdceff0),
    })
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8f4f3,
      emissive: 0xe8ffff,
      emissiveIntensity: 0.06,
      metalness: 0,
      roughness: 0.08,
      transmission: lowPower ? 0 : 0.78,
      thickness: 0.62,
      ior: 1.3,
      clearcoat: 1,
      transparent: true,
      opacity: lowPower ? 0.44 : 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const porcelainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xf3fbfb,
      emissiveIntensity: 0.08,
      metalness: 0.02,
      roughness: 0.31,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.9,
    })
    const graphiteMaterial = new THREE.MeshStandardMaterial({
      color: 0x283338,
      metalness: 0.6,
      roughness: 0.28,
      transparent: true,
      opacity: 0.58,
    })
    const warmMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xb49a72,
      metalness: 0.82,
      roughness: 0.24,
      transparent: true,
      opacity: 0.56,
    })
    const cyanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9adfe1,
      emissive: 0x93dfe2,
      emissiveIntensity: 0.16,
      metalness: 0.06,
      roughness: 0.13,
      clearcoat: 1,
      transparent: true,
      opacity: 0.92,
    })

    const outerShell = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.31, lowPower ? 18 : 28, lowPower ? 96 : 180, Math.PI * 1.72),
      glassMaterial,
    )
    outerShell.rotation.set(0.42, -0.36 * direction, -0.18 * direction)
    outerShell.scale.set(side === 'left' ? 1.28 : 1.1, side === 'left' ? 0.86 : 0.96, 1)
    sculpture.add(outerShell)

    const porcelainArc = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.19, lowPower ? 16 : 24, lowPower ? 82 : 150, Math.PI * 1.5),
      porcelainMaterial,
    )
    porcelainArc.rotation.set(-0.3, 0.46 * direction, 0.34 * direction)
    porcelainArc.scale.set(side === 'left' ? 1.16 : 1.03, side === 'left' ? 0.89 : 0.98, 1)
    sculpture.add(porcelainArc)

    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, lowPower ? 28 : 48, lowPower ? 20 : 34),
      pearlMaterial,
    )
    lens.scale.set(1.05, 0.9, 0.52)
    lens.rotation.set(0.08, -0.27 * direction, 0)
    sculpture.add(lens)

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, lowPower ? 20 : 32, lowPower ? 14 : 24),
      glassMaterial.clone(),
    )
    pupil.material.color.set(0xd9eeee)
    pupil.material.opacity = 0.8
    pupil.position.z = 0.48
    sculpture.add(pupil)

    const pupilRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.012, 10, 84),
      warmMetalMaterial,
    )
    pupilRim.position.z = 0.56
    sculpture.add(pupilRim)

    const orbitSpecs = [
      { radius: 1.88, tilt: [0.32, 0.58 * direction, 0.08], material: graphiteMaterial, nodeAngles: [0.18, 3.62] },
      { radius: 2.27, tilt: [1.05, -0.28 * direction, 0.6], material: glassMaterial, nodeAngles: [1.28, 4.96] },
      { radius: 2.64, tilt: [-0.68, 0.22 * direction, -0.36], material: warmMetalMaterial, nodeAngles: [0.72, 2.84, 5.4] },
    ]

    const orbitalGroups = orbitSpecs.map((spec, orbitIndex) => {
      const group = new THREE.Group()
      group.rotation.set(...spec.tilt)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(spec.radius, orbitIndex === 1 ? 0.008 : 0.012, 8, lowPower ? 120 : 220),
        spec.material.clone(),
      )
      if ('opacity' in ring.material) ring.material.opacity = orbitIndex === 1 ? 0.28 : 0.47
      group.add(ring)

      spec.nodeAngles.forEach((angle, nodeIndex) => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(nodeIndex === 0 ? 0.105 : 0.065, 18, 12),
          (orbitIndex + nodeIndex) % 3 === 0 ? cyanMaterial.clone() : porcelainMaterial.clone(),
        )
        node.position.set(Math.cos(angle) * spec.radius, Math.sin(angle) * spec.radius, 0)
        group.add(node)
      })

      orbitSystem.add(group)
      return group
    })

    const haloTexture = makeHaloTexture()
    if (haloTexture) {
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: haloTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }))
      halo.scale.set(6.4, 6.4, 1)
      halo.position.z = -1.4
      field.add(halo)
    }

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd5d6, 2.8))
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.7)
    keyLight.position.set(-2.8 * direction, 4.5, 6)
    scene.add(keyLight)
    const cyanLight = new THREE.PointLight(0xa7ebed, 11, 15, 2)
    cyanLight.position.set(2.9 * direction, -1.5, 4.2)
    scene.add(cyanLight)
    const warmLight = new THREE.PointLight(0xffecd3, 6.5, 13, 2)
    warmLight.position.set(-3.2 * direction, -2.2, 2.4)
    scene.add(warmLight)

    const pointer = new THREE.Vector2()
    const pointerTarget = new THREE.Vector2()
    let previousPointerX = 0
    let orbitAngle = direction * 0.16
    const baseVelocity = direction * 0.075
    let angularVelocity = baseVelocity
    let pulse = 0
    let frameId = 0
    let inViewport = true
    let contextAvailable = true
    let lastTime = window.performance.now()

    const positionField = (width, height) => {
      const compact = width < 520

      if (side === 'full') {
        const aspect = width / Math.max(height, 1)
        const scale = compact ? 0.94 : THREE.MathUtils.clamp(1.06 + (aspect - 1) * 0.12, 1.06, 1.22)
        field.position.set(0, compact ? -0.04 : 0.02, 0)
        field.scale.set(scale * (compact ? 1.08 : 1.48), scale, scale)
        field.rotation.y = -0.035
        return
      }

      const isLeft = side === 'left'
      field.position.x = direction * (compact ? 0.78 : isLeft ? 1.18 : 0.88)
      field.position.y = compact ? -0.08 : isLeft ? 0.18 : -0.12
      field.scale.setScalar(compact ? 0.86 : isLeft ? 1.06 : 0.94)
      field.rotation.y = direction * (isLeft ? -0.18 : -0.08)
    }

    const renderScene = () => renderer.render(scene, camera)

    const canAnimate = () => !reducedMotion && inViewport && !document.hidden && contextAvailable

    const stopRender = () => {
      if (!frameId) return
      window.cancelAnimationFrame(frameId)
      frameId = 0
    }

    const renderFrame = (now) => {
      frameId = 0
      if (!canAnimate()) return

      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      pointer.x = THREE.MathUtils.damp(pointer.x, pointerTarget.x, 6.8, delta)
      pointer.y = THREE.MathUtils.damp(pointer.y, pointerTarget.y, 6.8, delta)
      angularVelocity = THREE.MathUtils.damp(angularVelocity, baseVelocity, 1.55, delta)
      orbitAngle += angularVelocity * delta
      pulse = THREE.MathUtils.damp(pulse, 0, 3.2, delta)

      field.rotation.x = THREE.MathUtils.damp(field.rotation.x, pointer.y * 0.16, 5.5, delta)
      field.rotation.z = THREE.MathUtils.damp(field.rotation.z, pointer.x * -0.08 * direction, 5.5, delta)
      sculpture.rotation.y = orbitAngle * 0.48 + pointer.x * 0.13
      sculpture.rotation.x = Math.sin(now * 0.00022) * 0.055
      orbitSystem.rotation.y = orbitAngle + pointer.x * 0.22
      orbitSystem.rotation.z = Math.sin(now * 0.00016) * 0.08 * direction
      orbitalGroups.forEach((group, index) => {
        group.rotation.z += direction * delta * (0.025 + index * 0.014)
      })

      const pulseEase = 1 - Math.pow(1 - pulse, 3)
      const breath = 1 + Math.sin(now * 0.00072) * 0.016 + pulseEase * 0.075
      sculpture.scale.setScalar(breath)
      orbitSystem.scale.setScalar(1 + pulseEase * 0.095)
      cyanLight.intensity = 11 + pulseEase * 16
      pupil.material.opacity = 0.72 + pulseEase * 0.23

      camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.12, 4.8, delta)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.1, 4.8, delta)
      camera.lookAt(side === 'full' ? 0 : direction * 0.28, 0, 0)

      renderScene()
      frameId = window.requestAnimationFrame(renderFrame)
    }

    const startRender = () => {
      if (frameId || !canAnimate()) return
      lastTime = window.performance.now()
      frameId = window.requestAnimationFrame(renderFrame)
    }

    const triggerPulse = () => {
      pulse = 1
      angularVelocity += direction * 0.42
      if (reducedMotion) renderScene()
      else startRender()
    }
    pulseRef.current = triggerPulse

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setPixelRatio(clampDpr(lowPower))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.fov = width < 520 ? 38 : 31
      camera.updateProjectionMatrix()
      positionField(width, height)
      renderScene()
    }

    const onPointerMove = (event) => {
      if (reducedMotion) return
      const bounds = mount.getBoundingClientRect()
      const nextX = THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1)
      const nextY = THREE.MathUtils.clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1)
      angularVelocity += (nextX - previousPointerX) * direction * 0.14
      previousPointerX = nextX
      pointerTarget.set(nextX, nextY)
      startRender()
    }

    const onPointerLeave = () => {
      previousPointerX = 0
      pointerTarget.set(0, 0)
    }
    const onPointerDown = () => triggerPulse()

    const onVisibilityChange = () => {
      if (document.hidden) stopRender()
      else if (reducedMotion) renderScene()
      else startRender()
    }

    const onMotionPreferenceChange = (event) => {
      reducedMotion = event.matches
      if (reducedMotion) {
        stopRender()
        pointer.set(0, 0)
        pointerTarget.set(0, 0)
        renderScene()
      } else {
        startRender()
      }
    }

    const onContextLost = (event) => {
      event.preventDefault()
      contextAvailable = false
      stopRender()
      mount.dataset.fallback = 'true'
      mount.dataset.ready = 'false'
    }

    const onContextRestored = () => {
      contextAvailable = true
      delete mount.dataset.fallback
      mount.dataset.ready = 'true'
      resize()
      startRender()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      if (inViewport) {
        if (reducedMotion) renderScene()
        else startRender()
      } else {
        stopRender()
      }
    }, { rootMargin: '100px' })
    intersectionObserver.observe(mount)

    mount.addEventListener('pointermove', onPointerMove, { passive: true })
    mount.addEventListener('pointerleave', onPointerLeave)
    mount.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    motionQuery.addEventListener('change', onMotionPreferenceChange)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)

    resize()
    mount.dataset.ready = 'true'
    if (!reducedMotion) startRender()

    return () => {
      pulseRef.current = () => {}
      stopRender()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerleave', onPointerLeave)
      mount.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      motionQuery.removeEventListener('change', onMotionPreferenceChange)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)

      const materials = new Set([
        pearlMaterial,
        glassMaterial,
        porcelainMaterial,
        graphiteMaterial,
        warmMetalMaterial,
        cyanMaterial,
      ])
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material))
        else if (object.material) materials.add(object.material)
      })
      materials.forEach((material) => material.dispose())
      haloTexture?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [side])

  const activate = useCallback(() => {
    pulseRef.current()
    onActivateRef.current?.()
  }, [])

  const handleKeyDown = (event) => {
    if (!onActivate || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    activate()
  }

  const interactiveProps = onActivate
    ? { role: 'button', tabIndex: 0, 'aria-label': ariaLabel }
    : { 'aria-hidden': true }

  return (
    <div
      ref={mountRef}
      className={`kinetic-iris kinetic-iris--${side}`}
      data-interactive={onActivate ? 'true' : 'false'}
      onClick={onActivate ? activate : undefined}
      onKeyDown={handleKeyDown}
      {...interactiveProps}
    />
  )
}

export default KineticIris
