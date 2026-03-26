import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function makeCardCanvas(side, W = 1080, H = 640) {
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Cream paper gradient
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.8)
  grad.addColorStop(0, '#f5f0e4')
  grad.addColorStop(1, '#ede7d6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Paper grain
  for (let i = 0; i < 14000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.022})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.045})`
    ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 1)
  }

  // Letterpress: faint highlight below + shadow above = pressed into paper
  function lp(text, x, y, font, align = 'left', color = '#1c1c1c') {
    ctx.font = font
    ctx.textAlign = align
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(text, x, y + 1.3)
    ctx.shadowColor = 'rgba(0,0,0,0.16)'
    ctx.shadowBlur = 1.5
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0.5
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0
  }

  const pad = 64

  if (side === 'front') {
    lp('201  359  5688', pad, pad + 30, '400 23px Georgia, serif', 'left', '#1c1c1c')
    lp('Peak Aquatic Sports', W - pad, pad + 23, '400 19px Georgia, serif', 'right', '#1c1c1c')
    lp('Elite Aquatic Coaching', W - pad, pad + 44, '400 13.5px Georgia, serif', 'right', '#555')
    lp('Philip  KANG', W / 2, H / 2 + 14, 'italic 400 56px Georgia, serif', 'center', '#111')
    lp('Head Coach & Founder', W / 2, H / 2 + 56, '400 24px Georgia, serif', 'center', '#333')
    lp('Ramsey, NJ  ·  peakaquaticsports@gmail.com  ·  @philkangg', W / 2, H - pad + 10, '400 15px Georgia, serif', 'center', '#444')
  } else {
    ctx.font = 'italic 400 160px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(0,0,0,0.055)'
    ctx.fillText('PAS', W / 2, H / 2 + 56)
    lp('PEAK AQUATIC SPORTS', W / 2, H / 2 + 100, '400 14px Georgia, serif', 'center', 'rgba(0,0,0,0.28)')
  }

  return canvas
}

export default function BusinessCard3D() {
  const mountRef = useRef(null)
  const stateRef = useRef({})
  const [hint, setHint] = useState('HOVER TO TILT  ·  CLICK TO FLIP')

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Scene setup ──────────────────────────────────────────
    const W = el.clientWidth || 520
    const H = 320
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.set(0, 0, 4.2)

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xfff9f0, 1.2))
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.0)
    keyLight.position.set(2, 4, 3)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.3)
    fillLight.position.set(-3, -1, 2)
    scene.add(fillLight)
    const mouseLight = new THREE.PointLight(0xfff8ef, 0.7, 12)
    mouseLight.position.set(0, 2, 3)
    scene.add(mouseLight)

    // ── Card geometry ─────────────────────────────────────────
    const frontTex = new THREE.CanvasTexture(makeCardCanvas('front'))
    const backTex  = new THREE.CanvasTexture(makeCardCanvas('back'))
    const sideMat  = new THREE.MeshStandardMaterial({ color: 0xd6cfc0, roughness: 0.88, metalness: 0 })
    const materials = [
      sideMat, sideMat, sideMat, sideMat,
      new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.72, metalness: 0 }),
      new THREE.MeshStandardMaterial({ map: backTex,  roughness: 0.72, metalness: 0 }),
    ]
    const geo  = new THREE.BoxGeometry(3.37, 2.0, 0.028)
    const mesh = new THREE.Mesh(geo, materials)
    scene.add(mesh)

    // ── State ─────────────────────────────────────────────────
    const s = stateRef.current
    s.tiltX = 0; s.tiltY = 0
    s.targetTiltX = 0; s.targetTiltY = 0
    s.flipAngle = 0; s.targetFlip = 0
    s.flipped = false
    s.mouseX = 0; s.mouseY = 0

    // ── Mouse tilt ────────────────────────────────────────────
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
      s.targetTiltY =  nx * 0.38
      s.targetTiltX = -ny * 0.28
      mouseLight.position.set(nx * 3, -ny * 2, 3)
    }
    const onMouseLeave = () => {
      s.targetTiltX = 0; s.targetTiltY = 0
    }
    const onClick = () => {
      s.flipped = !s.flipped
      s.targetFlip = s.flipped ? Math.PI : 0
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)
    renderer.domElement.addEventListener('click', onClick)

    // ── Animation loop ────────────────────────────────────────
    let rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      s.tiltX += (s.targetTiltX - s.tiltX) * 0.07
      s.tiltY += (s.targetTiltY - s.tiltY) * 0.07
      s.flipAngle += (s.targetFlip - s.flipAngle) * 0.09
      mesh.rotation.x = s.tiltX
      mesh.rotation.y = s.tiltY + s.flipAngle
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth || 520
      camera.aspect = w / H
      camera.updateProjectionMatrix()
      renderer.setSize(w, H)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      renderer.domElement.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: 320, cursor: 'pointer' }}
      />
      <p style={{
        textAlign: 'center',
        fontFamily: 'Georgia, serif',
        fontSize: '0.58rem',
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.18em',
        marginTop: '0.75rem',
        textTransform: 'uppercase',
      }}>
        {hint}
      </p>
    </div>
  )
}
