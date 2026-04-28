let audioCtx: AudioContext | null = null
let tickTimer: ReturnType<typeof setTimeout> | null = null

export function useGachaSound() {
  function ensureAudio() {
    if (audioCtx || typeof window === 'undefined') return
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new Ctx()
    } catch {}
  }

  function tick(freq = 800) {
    if (!audioCtx) return
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.frequency.value = freq
    o.type = 'square'
    g.gain.setValueAtTime(0.06, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
    o.connect(g).connect(audioCtx.destination)
    o.start()
    o.stop(audioCtx.currentTime + 0.05)
  }

  function startSpinTicks(durationMs = 4000) {
    ensureAudio()
    if (!audioCtx) return
    let delay = 50
    let elapsed = 0
    const step = () => {
      tick(600 + Math.random() * 200)
      elapsed += delay
      delay = 50 + (elapsed / durationMs) * 250
      if (elapsed < durationMs) tickTimer = setTimeout(step, delay)
    }
    step()
  }

  function stopSpinTicks() {
    if (tickTimer) clearTimeout(tickTimer)
    tickTimer = null
  }

  function playWinChime() {
    if (!audioCtx) return
    ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tick(f), i * 90))
  }

  return { ensureAudio, startSpinTicks, stopSpinTicks, playWinChime }
}
