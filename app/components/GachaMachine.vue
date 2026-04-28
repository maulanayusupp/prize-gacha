<script setup lang="ts">
import type { Prize } from '~/types/gacha'
import { animate, slotEase, easeInOutCubic } from '~/composables/useEasing'

const props = defineProps<{ userName: string }>()
const emit = defineEmits<{ rolled: [prize: Prize] }>()

const { PRIZES, formatRp, startRoll } = useGacha()
const { ensureAudio, startSpinTicks, stopSpinTicks, playWinChime } = useGachaSound()

const ITEM_HEIGHT = 150          // smaller so items fill the window better
const TOTAL_ITEMS = 70
const WIN_INDEX = 62
const SPIN_MS = 6200             // slower, more dramatic
const WINDUP_MS = 520
const SETTLE_PAUSE = 900

const reelItems = ref<Prize[]>([])
const winningItemIdx = ref<number>(-1)
const machineEl = ref<HTMLElement | null>(null)
const windowEl = ref<HTMLElement | null>(null)
const reelEl = ref<HTMLElement | null>(null)
const isSpinning = ref(false)
const blurAmount = ref(0)
const sparkBurst = ref(false)

let cancelAnim: (() => void) | null = null

// translateY value that centers item at `idx` in the window
function centerY(idx: number): number {
  const winH = windowEl.value?.clientHeight ?? 320
  return -(idx * ITEM_HEIGHT) + (winH / 2 - ITEM_HEIGHT / 2)
}

function setTransform(y: number) {
  if (reelEl.value) reelEl.value.style.transform = `translate3d(0, ${y}px, 0)`
}

function setBlur(b: number) {
  blurAmount.value = b
  if (reelEl.value) reelEl.value.style.filter = b > 0.1 ? `blur(${b}px)` : ''
}

function buildReel(target: Prize | null = null) {
  const items: Prize[] = []
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    // Cluster the winning prize at WIN_INDEX-1..WIN_INDEX+1 so the
    // deceleration and any settle-overshoot reveal the SAME amount (no
    // "almost won X but jumped to Y" feel).
    if (target && i >= WIN_INDEX - 1 && i <= WIN_INDEX + 1) {
      items.push(target)
    } else {
      items.push(PRIZES[Math.floor(Math.random() * PRIZES.length)]!)
    }
  }
  reelItems.value = items
  winningItemIdx.value = -1
  setTransform(centerY(0))
  blurAmount.value = 0
}

async function roll() {
  if (isSpinning.value) return
  isSpinning.value = true
  ensureAudio()
  navigator.vibrate?.(15)

  const prize = startRoll()
  buildReel(prize)
  await nextTick()

  const initialY = centerY(0)             // current rest position
  const finalY = centerY(WIN_INDEX)       // where we want to end up
  const windupY = initialY + 24           // slight downward recoil (anticipation)

  // PHASE 1: Wind-up — pull reel slightly down before launching up
  cancelAnim = animate({
    duration: WINDUP_MS,
    ease: easeInOutCubic,
    onUpdate: (v) => setTransform(initialY + v * (windupY - initialY)),
    onComplete: () => {
      // PHASE 2: Main spin — windupY → finalY with slot easing
      const distance = finalY - windupY
      const maxBlur = 2
      startSpinTicks(SPIN_MS)

      cancelAnim = animate({
        duration: SPIN_MS,
        ease: slotEase,
        onUpdate: (v, t) => {
          setTransform(windupY + distance * v)
          const blurCurve = t < 0.5
            ? Math.sin((t / 0.5) * Math.PI) * maxBlur
            : 0
          setBlur(blurCurve)
        },
        onComplete: () => {
          stopSpinTicks()
          playWinChime()
          navigator.vibrate?.([30, 40, 80])
          setBlur(0)
          // snap precisely to final position (avoid sub-pixel drift)
          setTransform(finalY)
          winningItemIdx.value = WIN_INDEX
          sparkBurst.value = true
          setTimeout(() => {
            sparkBurst.value = false
            emit('rolled', prize)
            isSpinning.value = false
          }, SETTLE_PAUSE)
        },
      })
    },
  })
}

defineExpose({ roll, buildReel })
onMounted(() => buildReel())
onBeforeUnmount(() => cancelAnim?.())
</script>

<template>
  <div>
    <div class="text-center text-sm text-purple-300 tracking-[2px] uppercase mb-2">
      Hai, <strong class="text-gold font-extrabold">{{ props.userName }}</strong>
    </div>

    <div
      ref="machineEl"
      class="machine relative w-full aspect-square max-w-[380px] mx-auto my-6 rounded-[32px] overflow-hidden border-[3px] border-gold/40
             shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(255,215,0,0.1),0_0_40px_rgba(255,215,0,0.2)]
             transition-transform duration-300"
      :class="[isSpinning && 'spinning machine-shake']"
      :style="{
        background:
          'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.15), transparent 60%),' +
          'radial-gradient(circle at 70% 70%, rgba(138,43,226,0.2), transparent 60%),' +
          'linear-gradient(135deg, #2a0f4f, #0d0521)',
      }"
    >
      <div class="machine-glow" />

      <!-- Top & bottom shadow gradients (depth illusion) -->
      <div class="absolute inset-x-6 top-6 h-10 z-[3] pointer-events-none rounded-t-2xl
                  bg-gradient-to-b from-black/60 to-transparent" />
      <div class="absolute inset-x-6 bottom-6 h-10 z-[3] pointer-events-none rounded-b-2xl
                  bg-gradient-to-t from-black/60 to-transparent" />

      <div
        ref="windowEl"
        class="absolute inset-6 bg-black/50 rounded-2xl overflow-hidden border-2 border-white/10"
      >
        <div ref="reelEl" class="reel-track absolute inset-x-0 top-0">
          <div
            v-for="(item, i) in reelItems"
            :key="i"
            class="reel-item"
            :class="[
              winningItemIdx === i && 'reel-winner',
            ]"
          >
            <div class="icon">{{ item.icon }}</div>
            <div class="amount">
              <span class="currency">Rp</span>{{ formatRp(item.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Center indicator line -->
      <div
        class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 z-10 pointer-events-none
               bg-gradient-to-r from-transparent via-gold to-transparent
               shadow-[0_0_20px_#ffd700]"
      />

      <!-- Side arrows -->
      <div class="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-gold text-2xl
                  drop-shadow-[0_0_8px_#ffd700] animate-pulse pointer-events-none">▶</div>
      <div class="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-gold text-2xl
                  drop-shadow-[0_0_8px_#ffd700] animate-pulse pointer-events-none">◀</div>

      <!-- Spark burst on win -->
      <div v-if="sparkBurst" class="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div class="spark-ring" />
        <div class="spark-ring delay-100" />
        <div class="spark-ring delay-200" />
      </div>
    </div>

    <button
      class="btn-roll relative overflow-hidden"
      :class="[!isSpinning && 'breathe']"
      :disabled="isSpinning"
      @click="roll"
    >
      <span class="relative z-10">{{ isSpinning ? '✨ Spinning...' : '🎰 ROLL!' }}</span>
      <span v-if="!isSpinning" class="shine-sweep" />
    </button>
  </div>
</template>

<style scoped>
.machine-shake {
  animation: machineShake 0.18s ease-in-out infinite;
}
@keyframes machineShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1.5px); }
  75% { transform: translateX(1.5px); }
}

.reel-winner {
  animation: winnerPulse 0.6s ease-out;
}
.reel-winner .icon {
  animation: winnerIconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.reel-winner .amount {
  filter: drop-shadow(0 0 12px #ffd700) brightness(1.3);
}
@keyframes winnerPulse {
  0%   { transform: scale(1); filter: brightness(1); }
  40%  { transform: scale(1.12); filter: brightness(1.4); }
  100% { transform: scale(1); filter: brightness(1.1); }
}
@keyframes winnerIconBounce {
  0%   { transform: scale(1) rotate(0deg); }
  40%  { transform: scale(1.4) rotate(-8deg); }
  70%  { transform: scale(0.95) rotate(4deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}

.spark-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #ffd700;
  opacity: 0;
  animation: sparkExpand 0.9s ease-out forwards;
}
.spark-ring.delay-100 { animation-delay: 0.12s; border-color: #fff700; }
.spark-ring.delay-200 { animation-delay: 0.24s; border-color: #ff8c00; }
@keyframes sparkExpand {
  0%   { transform: scale(0.3); opacity: 1; border-width: 4px; }
  100% { transform: scale(4);   opacity: 0; border-width: 1px; }
}

.breathe {
  animation: gradientShift 3s ease infinite, breathe 2.4s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: scale(1); box-shadow: 0 12px 32px rgba(131,56,236,0.5), inset 0 -4px 0 rgba(0,0,0,0.3); }
  50%      { transform: scale(1.025); box-shadow: 0 16px 40px rgba(131,56,236,0.75), 0 0 30px rgba(255,0,150,0.4), inset 0 -4px 0 rgba(0,0,0,0.3); }
}

.shine-sweep {
  position: absolute;
  top: 0;
  left: -120%;
  width: 80%;
  height: 100%;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%);
  animation: shineSweep 2.6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes shineSweep {
  0%   { left: -120%; }
  60%  { left: 120%; }
  100% { left: 120%; }
}

.reel-track {
  will-change: transform, filter;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}
</style>
