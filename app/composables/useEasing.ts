// Easing primitives — pure functions, t in [0,1] → output in ~[0,1]

export const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

export const easeOutQuart = (t: number) =>
  1 - Math.pow(1 - t, 4)

export const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Slot-machine specific: ramp-up → cruise → decelerate → settle
// Monotonic (no overshoot) so the visible item never moves backward,
// preventing "almost won X but jumped to Y" perception.
export const slotEase = (t: number) => {
  if (t < 0.15) {
    // ramp up to cruise speed (ease-in)
    const k = t / 0.15
    return 0.08 * k * k
  }
  if (t < 0.55) {
    // near-linear cruise — fastest sustained phase
    const k = (t - 0.15) / 0.40
    return 0.08 + 0.50 * k
  }
  // gentle deceleration that smoothly arrives at 1.0 (no overshoot)
  const k = (t - 0.55) / 0.45
  return 0.58 + 0.42 * easeOutQuart(k)
}

export function animate({
  duration,
  ease = (t: number) => t,
  onUpdate,
  onComplete,
}: {
  duration: number
  ease?: (t: number) => number
  onUpdate: (v: number, t: number) => void
  onComplete?: () => void
}) {
  let raf = 0
  const start = performance.now()
  const tick = (now: number) => {
    const elapsed = now - start
    const t = Math.min(1, elapsed / duration)
    onUpdate(ease(t), t)
    if (t < 1) raf = requestAnimationFrame(tick)
    else onComplete?.()
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
