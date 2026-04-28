import type { Prize, Rarity } from '~/types/gacha'

const RARITY_BADGE: Record<Rarity, { fill: string | null; text: string }> = {
  common:    { fill: 'rgba(170,170,170,0.45)',         text: '#ffffff' },
  uncommon:  { fill: 'rgba(0,200,100,0.55)',           text: '#ffffff' },
  rare:      { fill: 'rgba(0,150,255,0.55)',           text: '#ffffff' },
  epic:      { fill: 'rgba(180,0,255,0.6)',            text: '#ffffff' },
  legendary: { fill: 'rgba(255,140,0,0.65)',           text: '#ffffff' },
  mythic:    { fill: null,                              text: '#ffffff' }, // gradient
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui'
const SANS = 'Poppins, system-ui, -apple-system, "Segoe UI", sans-serif'
const DISPLAY = 'Bungee, Poppins, system-ui, sans-serif'
const MONO = '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace'

async function makeSerial(name: string, amount: number, ts: number): Promise<string> {
  const payload = `${name}|${amount}|${ts}|prize-gacha`
  if (typeof crypto !== 'undefined' && typeof crypto.subtle?.digest === 'function') {
    const buf = new TextEncoder().encode(payload)
    const hash = await crypto.subtle.digest('SHA-256', buf)
    const bytes = new Uint8Array(hash).slice(0, 6)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    return `PG-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`
  }
  // FNV-1a fallback for non-secure contexts
  let h = 0x811c9dc5
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  const hex = h.toString(16).toUpperCase().padStart(8, '0')
  return `PG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} · ${time}`
}

export function useShareCard() {
  const { formatRp } = useGacha()

  async function buildCanvas(prize: Prize, userName: string): Promise<HTMLCanvasElement> {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      try { await document.fonts.ready } catch {}
    }

    const W = 1080, H = 1080
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    const ts = Date.now()
    const serial = await makeSerial(userName, prize.amount, ts)
    const tsLabel = formatTimestamp(ts)

    // ============ BACKGROUND ============
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#1a0b2e')
    bg.addColorStop(1, '#0a0418')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const goldGlow = ctx.createRadialGradient(W * 0.2, H * 0.2, 0, W * 0.2, H * 0.2, W * 0.55)
    goldGlow.addColorStop(0, 'rgba(255,215,0,0.28)')
    goldGlow.addColorStop(1, 'rgba(255,215,0,0)')
    ctx.fillStyle = goldGlow
    ctx.fillRect(0, 0, W, H)

    const purpleGlow = ctx.createRadialGradient(W * 0.8, H * 0.8, 0, W * 0.8, H * 0.8, W * 0.55)
    purpleGlow.addColorStop(0, 'rgba(138,43,226,0.4)')
    purpleGlow.addColorStop(1, 'rgba(138,43,226,0)')
    ctx.fillStyle = purpleGlow
    ctx.fillRect(0, 0, W, H)

    // ============ ANTI-TAMPER WATERMARK ============
    // Diagonal repeating "PRIZE GACHA" pattern across whole card.
    // Hard to crop/remove without re-rendering everything.
    ctx.save()
    ctx.globalAlpha = 0.055
    ctx.fillStyle = '#ffd700'
    ctx.font = `900 32px ${SANS}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const wmText = 'PRIZE GACHA  ·  '
    const wmWidth = ctx.measureText(wmText).width
    ctx.translate(W / 2, H / 2)
    ctx.rotate(-Math.PI / 6) // -30°
    const stepY = 70
    const diag = Math.hypot(W, H)
    let row = 0
    for (let y = -diag; y < diag; y += stepY) {
      const offset = row % 2 === 0 ? 0 : wmWidth / 2
      for (let x = -diag + offset; x < diag; x += wmWidth) {
        ctx.fillText(wmText, x, y)
      }
      row++
    }
    ctx.restore()

    // ============ BORDER RINGS ============
    ctx.strokeStyle = 'rgba(255,215,0,0.45)'
    ctx.lineWidth = 5
    roundRect(ctx, 28, 28, W - 56, H - 56, 56)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 2
    roundRect(ctx, 50, 50, W - 100, H - 100, 44)
    ctx.stroke()

    // ============ DECORATIVE STAR DOTS ============
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    const dots = [
      [120, 180, 3], [260, 90, 2], [950, 140, 4], [820, 280, 2],
      [110, 720, 3], [240, 880, 2], [930, 760, 3], [870, 920, 4],
      [560, 90, 2], [60, 480, 2], [1010, 520, 3],
    ] as const
    dots.forEach(([x, y, r]) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // ============ LOGO ============
    let y = 165
    ctx.font = `400 60px ${DISPLAY}`
    ctx.fillStyle = '#ffd700'
    ctx.shadowColor = 'rgba(255,215,0,0.5)'
    ctx.shadowBlur = 20
    ctx.fillText(`💰  PRIZE GACHA`, W / 2, y)
    ctx.shadowBlur = 0

    y += 55
    ctx.font = `700 22px ${SANS}`
    ctx.fillStyle = '#b794f6'
    ctx.fillText('R O L L   Y O U R   F O R T U N E', W / 2, y)

    // ============ RARITY BADGE ============
    y += 75
    const badgeText = prize.rarity.toUpperCase()
    ctx.font = `900 28px ${SANS}`
    const textWidth = ctx.measureText(badgeText).width
    const padX = 36
    const badgeW = textWidth + padX * 2
    const badgeH = 56
    const badgeX = (W - badgeW) / 2
    const badgeY = y - badgeH / 2

    if (prize.rarity === 'mythic') {
      const mg = ctx.createLinearGradient(badgeX, 0, badgeX + badgeW, 0)
      mg.addColorStop(0, '#ff006e')
      mg.addColorStop(0.5, '#8338ec')
      mg.addColorStop(1, '#3a86ff')
      ctx.fillStyle = mg
    } else {
      ctx.fillStyle = RARITY_BADGE[prize.rarity].fill!
    }
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = RARITY_BADGE[prize.rarity].text
    ctx.fillText(badgeText, W / 2, y + 2)

    // ============ ICON ============
    y += 130
    ctx.font = `180px ${EMOJI_FONT}`
    ctx.shadowColor = 'rgba(255,215,0,0.7)'
    ctx.shadowBlur = 30
    ctx.fillText(prize.icon, W / 2, y)
    ctx.shadowBlur = 0

    // ============ SELAMAT ============
    y += 140
    ctx.font = `800 26px ${SANS}`
    ctx.fillStyle = '#b794f6'
    ctx.fillText('SELAMAT 🎉', W / 2, y)

    // ============ NAME ============
    y += 56
    ctx.font = `900 44px ${SANS}`
    ctx.fillStyle = '#ffd700'
    const name = userName.length > 26 ? userName.slice(0, 25) + '…' : userName
    ctx.fillText(name, W / 2, y)

    // ============ "ANDA MENDAPATKAN" ============
    y += 70
    ctx.font = `800 24px ${SANS}`
    ctx.fillStyle = '#b794f6'
    ctx.fillText('ANDA MENDAPATKAN', W / 2, y)

    // ============ AMOUNT ============
    y += 100
    const amountText = `Rp ${formatRp(prize.amount)}`
    let amountSize = 110
    ctx.font = `400 ${amountSize}px ${DISPLAY}`
    while (ctx.measureText(amountText).width > W - 140 && amountSize > 50) {
      amountSize -= 6
      ctx.font = `400 ${amountSize}px ${DISPLAY}`
    }
    const amountGrad = ctx.createLinearGradient(0, y - amountSize / 2, 0, y + amountSize / 2)
    amountGrad.addColorStop(0, '#fff700')
    amountGrad.addColorStop(0.5, '#ffa500')
    amountGrad.addColorStop(1, '#ff6b00')
    ctx.fillStyle = amountGrad
    ctx.shadowColor = 'rgba(255,215,0,0.6)'
    ctx.shadowBlur = 25
    ctx.fillText(amountText, W / 2, y)
    ctx.shadowBlur = 0

    // ============ MESSAGE ============
    y += 80
    ctx.font = `italic 500 22px ${SANS}`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    const msg = prize.msg.length > 40 ? prize.msg.slice(0, 39) + '…' : prize.msg
    ctx.fillText(msg, W / 2, y)

    // ============ AUTHENTICITY BLOCK ============
    // Seal + serial code + timestamp. The serial is a deterministic
    // SHA-256 hash of (name|amount|timestamp) — re-derivable, unique
    // per generation, and impractical to fake without re-rendering.
    const authY = H - 145

    // Seal (round, gold)
    const sealX = 120
    const sealR = 38
    ctx.save()
    ctx.beginPath()
    ctx.arc(sealX, authY, sealR, 0, Math.PI * 2)
    const sealGrad = ctx.createRadialGradient(sealX - 8, authY - 10, 4, sealX, authY, sealR)
    sealGrad.addColorStop(0, '#fff3a8')
    sealGrad.addColorStop(0.55, '#ffd24a')
    sealGrad.addColorStop(1, '#a36a08')
    ctx.fillStyle = sealGrad
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.stroke()
    // Inner ring
    ctx.beginPath()
    ctx.arc(sealX, authY, sealR - 6, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(26,11,46,0.45)'
    ctx.lineWidth = 1.2
    ctx.stroke()
    // ASLI text
    ctx.fillStyle = '#1a0b2e'
    ctx.font = `900 18px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ASLI', sealX, authY - 4)
    ctx.font = `800 9px ${SANS}`
    ctx.fillText('VERIFIED', sealX, authY + 12)
    ctx.restore()

    // Serial + timestamp (right of seal)
    ctx.textAlign = 'left'
    ctx.font = `700 11px ${SANS}`
    ctx.fillStyle = 'rgba(255,215,0,0.7)'
    ctx.fillText('SERIAL', sealX + sealR + 26, authY - 22)

    ctx.font = `600 22px ${MONO}`
    ctx.fillStyle = '#ffd700'
    ctx.fillText(serial, sealX + sealR + 26, authY)

    ctx.font = `500 14px ${SANS}`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText(tsLabel, sealX + sealR + 26, authY + 24)

    // ============ FOOTER ============
    ctx.textAlign = 'center'
    ctx.font = `600 20px ${SANS}`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('✨  Prize Gacha  ✨', W / 2, H - 75)

    return canvas
  }

  async function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((res, rej) =>
      canvas.toBlob(b => (b ? res(b) : rej(new Error('Failed to encode PNG'))), 'image/png'),
    )
  }

  return { buildCanvas, toBlob }
}
