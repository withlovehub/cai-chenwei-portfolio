import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './ThreeHero.css'

const seededRandom = (() => {
  let seed = 2601
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
})()

function ThreeHero({ boosted = false }) {
  const mountRef = useRef(null)
  const boostedRef = useRef(boosted)

  useEffect(() => {
    boostedRef.current = boosted
  }, [boosted])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      mount.dataset.fallback = 'true'
      return undefined
    }

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      mount.dataset.fallback = 'true'
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 7.2)

    const deviceMemory = navigator.deviceMemory || 8
    const saveData = Boolean(navigator.connection?.saveData)
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const lowPower = saveData || deviceMemory < 6 || coarsePointer

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.6))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    const world = new THREE.Group()
    world.position.set(1.25, 0.05, 0)
    scene.add(world)

    const coreGeometry = new THREE.IcosahedronGeometry(1.48, lowPower ? 2 : 4)
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x173841,
      emissive: 0x06191f,
      emissiveIntensity: 0.68,
      metalness: 0.2,
      roughness: 0.13,
      transmission: lowPower ? 0 : 0.62,
      thickness: 1.45,
      ior: 1.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.92,
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.rotation.set(-0.42, 0.55, 0.18)
    world.add(core)

    const cageGeometry = new THREE.IcosahedronGeometry(1.66, 2)
    const cageMaterial = new THREE.MeshBasicMaterial({
      color: 0x67e7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    })
    const cage = new THREE.Mesh(cageGeometry, cageMaterial)
    cage.rotation.set(0.2, -0.36, 0.1)
    world.add(cage)

    const orbitalMaterial = new THREE.MeshBasicMaterial({
      color: 0x8eefff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    })
    const orbitals = [
      { radius: 2.2, tube: 0.008, rotation: [0.7, 0.1, 0.2] },
      { radius: 2.55, tube: 0.006, rotation: [-0.28, 0.7, 0.85] },
      { radius: 2.9, tube: 0.005, rotation: [1.1, -0.25, 0.36] },
    ].map(({ radius, tube, rotation }) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 180), orbitalMaterial.clone())
      mesh.rotation.set(...rotation)
      world.add(mesh)
      return mesh
    })

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.15, 0.018, 240, 10, 2, 5),
      new THREE.MeshBasicMaterial({
        color: 0xff6859,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
      }),
    )
    knot.rotation.set(0.4, 0.18, -0.3)
    world.add(knot)

    const particleCount = lowPower ? 320 : 760
    const positions = new Float32Array(particleCount * 3)
    const particleSizes = new Float32Array(particleCount)
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.8 + seededRandom() * 5.6
      const theta = seededRandom() * Math.PI * 2
      const phi = Math.acos(2 * seededRandom() - 1)
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[index * 3 + 2] = radius * Math.cos(phi)
      particleSizes[index] = 0.35 + seededRandom() * 0.65
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xa8eff9,
        size: 0.022,
        transparent: true,
        opacity: 0.66,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    world.add(particles)

    scene.add(new THREE.HemisphereLight(0x9eeeff, 0x071015, 1.85))
    const cyanLight = new THREE.PointLight(0x67e7ff, 18, 16, 2)
    cyanLight.position.set(3.5, 2.8, 4)
    scene.add(cyanLight)
    const coralLight = new THREE.PointLight(0xff6859, 13, 14, 2)
    coralLight.position.set(-3, -2.2, 3)
    scene.add(coralLight)

    const pointer = new THREE.Vector2(0, 0)
    const pointerTarget = new THREE.Vector2(0, 0)
    let scrollTarget = 0
    let scrollValue = 0
    let frame = 0
    let visible = true
    let impulse = 0
    let impulseTarget = 0
    const interactionSurface = mount.closest('.hero') || mount

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      world.position.x = width > 900 ? 1.35 : 0.55
    }

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect()
      pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    }

    const onPointerLeave = () => pointerTarget.set(0, 0)

    const onPointerDown = () => {
      impulseTarget = 1
      window.setTimeout(() => { impulseTarget = 0 }, 90)
    }

    const onScroll = () => {
      const rect = mount.getBoundingClientRect()
      scrollTarget = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1)
    }

    const startRender = () => {
      if (!frame && visible && !document.hidden) frame = window.requestAnimationFrame(render)
    }

    const stopRender = () => {
      if (!frame) return
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) startRender()
      else stopRender()
    }, { rootMargin: '120px' })
    visibilityObserver.observe(mount)

    const onVisibilityChange = () => {
      if (document.hidden) stopRender()
      else startRender()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    interactionSurface.addEventListener('pointermove', onPointerMove, { passive: true })
    interactionSurface.addEventListener('pointerleave', onPointerLeave)
    interactionSurface.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onContextLost = (event) => {
      event.preventDefault()
      stopRender()
      mount.dataset.ready = 'false'
      mount.dataset.fallback = 'true'
    }

    const onContextRestored = () => {
      delete mount.dataset.fallback
      mount.dataset.ready = 'true'
      startRender()
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)
    resize()
    onScroll()

    const startTime = window.performance.now()
    const render = () => {
      frame = 0
      if (!visible || document.hidden) return

      const elapsed = (window.performance.now() - startTime) / 1000
      const energy = boostedRef.current ? 1.85 : 1
      pointer.lerp(pointerTarget, 0.055)
      scrollValue += (scrollTarget - scrollValue) * 0.045
      impulse += (impulseTarget - impulse) * (impulseTarget > impulse ? 0.34 : 0.075)

      world.rotation.y += 0.0019 * energy
      world.rotation.x = pointer.y * 0.22 + scrollValue * 0.45
      world.rotation.z = pointer.x * -0.08
      core.rotation.y += 0.0024 * energy
      core.rotation.x += 0.00115 * energy
      cage.rotation.y -= 0.0015 * energy
      cage.rotation.z += 0.0008 * energy
      knot.rotation.z -= 0.0015 * energy
      knot.rotation.x = 0.4 + Math.sin(elapsed * 0.34) * 0.12
      particles.rotation.y = elapsed * 0.012 * energy
      particles.rotation.x = -elapsed * 0.005
      orbitals.forEach((orbital, index) => {
        orbital.rotation.z += (0.00045 + index * 0.00014) * energy
      })

      const breath = 1 + Math.sin(elapsed * (boostedRef.current ? 1.8 : 0.72)) * 0.035 * energy + impulse * 0.16
      core.scale.setScalar(breath)
      cage.scale.setScalar(1 + Math.sin(elapsed * 0.58) * 0.018 + impulse * 0.1)
      particles.scale.setScalar(1 + impulse * 0.2)
      cyanLight.intensity = 18 + impulse * 26
      coralLight.intensity = 13 + impulse * 18
      camera.position.x += (pointer.x * 0.38 - camera.position.x) * 0.035
      camera.position.y += (pointer.y * 0.25 - camera.position.y) * 0.035
      camera.position.z = 7.2 - scrollValue * 0.9
      camera.lookAt(world.position.x * 0.25, 0, 0)

      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(render)
    }
    startRender()
    mount.dataset.ready = 'true'

    return () => {
      window.cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      interactionSurface.removeEventListener('pointermove', onPointerMove)
      interactionSurface.removeEventListener('pointerleave', onPointerLeave)
      interactionSurface.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else if (object.material) object.material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="three-hero" ref={mountRef} aria-hidden="true" />
}

export default ThreeHero
