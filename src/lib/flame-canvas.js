// src/lib/flame-canvas.js
//
// Anima la llama de partículas (chispas, brasas, humo) sobre un
// <canvas id="fogonCanvas" width="200" height="280">. Se construyó
// originalmente para /registro; ahora también la usa la landing,
// así que vive en un solo lugar para no mantener dos copias.
//
// Uso: import { initFlameCanvas } from '../lib/flame-canvas'
//      initFlameCanvas('fogonCanvas')

export function initFlameCanvas(canvasId = 'fogonCanvas') {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const CONFIG = {
    flameBaseY: 240,
    flameWidth: 70,
    flameHeight: 160,
    colors: {
      core: '#FFD700',
      mid: '#FF6B35',
      outer: '#C73E1D',
      ember: '#FF4500',
      spark: '#FFE4B5',
    }
  }

  class Particle {
    constructor(x, y, type) {
      this.x = x; this.y = y; this.type = type
      this.reset()
    }
    reset() {
      const spread = this.type === 'smoke' ? 40 : 20
      this.x = 100 + (Math.random() - 0.5) * spread
      this.y = this.type === 'smoke' ? 180 : CONFIG.flameBaseY - 10
      this.vx = (Math.random() - 0.5) * (this.type === 'spark' ? 2 : 0.8)
      this.vy = this.type === 'smoke' ? -0.5 - Math.random() * 0.8 : -2 - Math.random() * 4
      this.life = 1
      this.decay = this.type === 'spark' ? 0.015 + Math.random() * 0.02 : 0.003 + Math.random() * 0.005
      this.size = this.type === 'spark' ? 1.5 + Math.random() * 2.5 : this.type === 'ember' ? 2 + Math.random() * 3 : 8 + Math.random() * 12
      this.maxSize = this.size
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life -= this.decay
      if (this.type === 'spark') {
        this.vx += (Math.random() - 0.5) * 0.3
        this.vy += 0.05
        this.size = this.maxSize * this.life
      } else if (this.type === 'ember') {
        this.vx += Math.sin(Date.now() * 0.003 + this.y * 0.1) * 0.1
        this.size = this.maxSize * (0.5 + this.life * 0.5)
      } else {
        this.size += 0.15
        this.vx += (Math.random() - 0.5) * 0.05
      }
    }
    draw(ctx) {
      if (this.life <= 0) return
      ctx.save()
      ctx.globalAlpha = this.life * (this.type === 'smoke' ? 0.15 : 0.9)
      if (this.type === 'spark') {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
        gradient.addColorStop(0, CONFIG.colors.spark)
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.5)')
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#FFF'
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2); ctx.fill()
      } else if (this.type === 'ember') {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
        gradient.addColorStop(0, CONFIG.colors.core)
        gradient.addColorStop(0.5, CONFIG.colors.ember)
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill()
      } else {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
        gradient.addColorStop(0, 'rgba(100, 80, 70, 0.3)')
        gradient.addColorStop(0.5, 'rgba(60, 40, 30, 0.1)')
        gradient.addColorStop(1, 'rgba(30, 20, 15, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
    }
  }

  function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, (num >> 16) + percent)
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent)
    const b = Math.min(255, (num & 0x00FF) + percent)
    return `rgb(${r},${g},${b})`
  }

  function drawFlameLayer(cx, cy, width, height, time, freq1, freq2, color, alphaBase) {
    ctx.save()
    ctx.globalAlpha = alphaBase
    const flicker = Math.sin(time * 0.003) * 5
    const wobble1 = Math.sin(time * freq1) * 8
    const wobble2 = Math.cos(time * freq2) * 6
    const wobble3 = Math.sin(time * freq1 * 1.7) * 4

    ctx.beginPath()
    ctx.moveTo(cx - width / 2, cy)
    ctx.bezierCurveTo(
      cx - width / 2 + wobble1, cy - height * 0.3,
      cx - width / 4 + wobble2, cy - height * 0.7,
      cx + wobble3, cy - height + flicker
    )
    ctx.bezierCurveTo(
      cx + width / 4 + wobble2, cy - height * 0.7,
      cx + width / 2 + wobble1, cy - height * 0.3,
      cx + width / 2, cy
    )
    ctx.closePath()

    const grad = ctx.createLinearGradient(cx, cy, cx, cy - height)
    grad.addColorStop(0, color)
    grad.addColorStop(0.4, color)
    grad.addColorStop(0.8, adjustColor(color, 30))
    grad.addColorStop(1, 'rgba(255, 200, 100, 0.3)')
    ctx.fillStyle = grad
    ctx.fill()

    ctx.globalAlpha = alphaBase * 0.3
    ctx.fillStyle = 'rgba(255, 255, 200, 0.2)'
    ctx.fill()
    ctx.restore()
  }

  function drawFlame(time) {
    const baseX = 100, baseY = CONFIG.flameBaseY

    ctx.save()
    ctx.globalAlpha = 0.15 + Math.sin(time * 0.002) * 0.05
    const ambientGlow = ctx.createRadialGradient(baseX, baseY - 60, 20, baseX, baseY - 60, 120)
    ambientGlow.addColorStop(0, 'rgba(255, 107, 53, 0.6)')
    ambientGlow.addColorStop(0.5, 'rgba(199, 62, 29, 0.2)')
    ambientGlow.addColorStop(1, 'rgba(199, 62, 29, 0)')
    ctx.fillStyle = ambientGlow
    ctx.fillRect(0, 0, 200, 280)
    ctx.restore()

    drawFlameLayer(baseX, baseY, 80, 150, time, 0.003, 0.015, CONFIG.colors.outer, 0.7)
    drawFlameLayer(baseX, baseY, 60, 120, time, 0.004, 0.012, CONFIG.colors.mid, 0.8)
    drawFlameLayer(baseX, baseY, 35, 80, time, 0.005, 0.008, CONFIG.colors.core, 0.9)

    ctx.save()
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.004) * 0.2
    const coreGlow = ctx.createRadialGradient(baseX, baseY - 40, 5, baseX, baseY - 40, 30)
    coreGlow.addColorStop(0, 'rgba(255, 255, 200, 0.9)')
    coreGlow.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)')
    coreGlow.addColorStop(1, 'rgba(255, 107, 53, 0)')
    ctx.fillStyle = coreGlow
    ctx.beginPath(); ctx.arc(baseX, baseY - 40, 30, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  function drawBase() {
    ctx.save()
    const heatGlow = ctx.createRadialGradient(100, 240, 5, 100, 240, 40)
    heatGlow.addColorStop(0, 'rgba(255, 100, 50, 0.4)')
    heatGlow.addColorStop(1, 'rgba(255, 100, 50, 0)')
    ctx.fillStyle = heatGlow
    ctx.beginPath(); ctx.ellipse(100, 240, 35, 10, 0, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#1a0f0a'
    ctx.beginPath(); ctx.ellipse(100, 242, 30, 6, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#2a1a10'
    ctx.beginPath(); ctx.ellipse(95, 245, 25, 5, -0.3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(105, 243, 22, 5, 0.3, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  const sparks = [], embers = [], smokes = []
  for (let i = 0; i < 15; i++) sparks.push(new Particle(100, 230, 'spark'))
  for (let i = 0; i < 8; i++) embers.push(new Particle(100, 200, 'ember'))
  for (let i = 0; i < 5; i++) smokes.push(new Particle(100, 180, 'smoke'))

  function animate() {
    const time = Date.now()
    ctx.clearRect(0, 0, 200, 280)
    ctx.fillStyle = '#0d0a0a'
    ctx.fillRect(0, 0, 200, 280)

    drawBase()
    drawFlame(time)
    ;[...smokes, ...embers, ...sparks].forEach(p => {
      p.update(); p.draw(ctx)
      if (p.life <= 0) p.reset()
    })

    requestAnimationFrame(animate)
  }

  animate()
}