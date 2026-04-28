const BGM_MUTE_KEY = 'pg_bgm_muted'
const BGM_VOLUME = 0.16

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let voiceBus: GainNode | null = null
let filter: BiquadFilterNode | null = null
let scheduler: ReturnType<typeof setInterval> | null = null
let nextNoteTime = 0
let stepIdx = 0
let isPlaying = false

const isMuted = ref(false)
const isStarted = ref(false)
let hydrated = false

const BPM = 100
const STEP_DUR = 60 / BPM / 2 // 8th note ≈ 0.3s

const N: Record<string, number> = {
  A2: 110, F2: 87.307, C3: 130.81, G2: 98,
  E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880,
}

// 32 eighth-note pattern: Am — F — C — G (≈9.6s loop @ 100 BPM)
const MELODY: (keyof typeof N | null)[] = [
  'A4', 'E5', 'A5', 'C5', 'E5', 'A4', 'E5', 'C5',
  'F4', 'A4', 'C5', 'A4', 'F4', 'C5', 'A4', 'F4',
  'C5', 'E5', 'G4', 'E4', 'C5', 'G4', 'E5', 'C5',
  'G4', 'D5', 'B4', 'D5', 'G4', 'B4', 'D5', 'G4',
]

const BASS: (keyof typeof N | null)[] = [
  'A2', null, null, null, null, null, null, null,
  'F2', null, null, null, null, null, null, null,
  'C3', null, null, null, null, null, null, null,
  'G2', null, null, null, null, null, null, null,
]

function playLead(time: number, freq: number) {
  if (!ctx || !filter) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'triangle'
  o.frequency.value = freq
  g.gain.setValueAtTime(0, time)
  g.gain.linearRampToValueAtTime(0.22, time + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, time + STEP_DUR * 0.9)
  o.connect(g).connect(filter)
  o.start(time)
  o.stop(time + STEP_DUR)
}

function playBass(time: number, freq: number) {
  if (!ctx || !filter) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  g.gain.setValueAtTime(0, time)
  g.gain.linearRampToValueAtTime(0.32, time + 0.02)
  g.gain.setValueAtTime(0.32, time + STEP_DUR * 6)
  g.gain.exponentialRampToValueAtTime(0.001, time + STEP_DUR * 8 * 0.95)
  o.connect(g).connect(filter)
  o.start(time)
  o.stop(time + STEP_DUR * 8)
}

function tick() {
  if (!ctx || !isPlaying) return
  const lookahead = 0.15
  while (nextNoteTime < ctx.currentTime + lookahead) {
    const idx = stepIdx % MELODY.length
    const lead = MELODY[idx]
    const bass = BASS[idx]
    if (lead) playLead(nextNoteTime, N[lead])
    if (bass) playBass(nextNoteTime, N[bass])
    nextNoteTime += STEP_DUR
    stepIdx++
  }
}

function setupContext() {
  if (ctx || typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    ctx = new Ctx()
    masterGain = ctx.createGain()
    masterGain.gain.value = isMuted.value ? 0 : BGM_VOLUME
    voiceBus = ctx.createGain()
    voiceBus.gain.value = 1
    filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2600
    filter.Q.value = 0.6
    filter.connect(voiceBus).connect(masterGain).connect(ctx.destination)
  } catch {}
}

async function start() {
  if (isMuted.value) {
    isStarted.value = true
    return
  }
  setupContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try { await ctx.resume() } catch {}
  }
  if (isPlaying) return
  isPlaying = true
  isStarted.value = true
  nextNoteTime = ctx.currentTime + 0.05
  stepIdx = 0
  tick()
  scheduler = setInterval(tick, 50)
}

function stop() {
  isPlaying = false
  if (scheduler) clearInterval(scheduler)
  scheduler = null
}

function setMuted(value: boolean) {
  isMuted.value = value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(BGM_MUTE_KEY, String(value))
  }
  if (masterGain && ctx) {
    const t = ctx.currentTime
    masterGain.gain.cancelScheduledValues(t)
    masterGain.gain.setValueAtTime(masterGain.gain.value, t)
    masterGain.gain.linearRampToValueAtTime(value ? 0 : BGM_VOLUME, t + 0.15)
  }
  if (!value && !isPlaying) start()
}

function toggleMute() {
  setMuted(!isMuted.value)
}

function duck(durationMs: number) {
  if (!ctx || !voiceBus || isMuted.value) return
  const t = ctx.currentTime
  voiceBus.gain.cancelScheduledValues(t)
  voiceBus.gain.setValueAtTime(voiceBus.gain.value, t)
  voiceBus.gain.linearRampToValueAtTime(0.25, t + 0.2)
  voiceBus.gain.setValueAtTime(0.25, t + Math.max(0.3, durationMs / 1000 - 0.4))
  voiceBus.gain.linearRampToValueAtTime(1, t + durationMs / 1000)
}

export function useGachaBGM() {
  if (!hydrated && typeof localStorage !== 'undefined') {
    isMuted.value = localStorage.getItem(BGM_MUTE_KEY) === 'true'
    hydrated = true
  }
  return {
    isMuted: readonly(isMuted),
    isStarted: readonly(isStarted),
    start,
    stop,
    toggleMute,
    setMuted,
    duck,
  }
}
