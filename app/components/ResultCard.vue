<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'
import type { Prize } from '~/types/gacha'

const props = defineProps<{ prize: Prize; userName: string }>()
const emit = defineEmits<{
  rollAgain: []
  share: []
  download: []
}>()

const { formatRp } = useGacha()

// Count-up animation for the amount
const target = ref(0)
const animatedAmount = useTransition(target, {
  duration: 1400,
  transition: TransitionPresets.easeOutExpo,
})
const display = computed(() => formatRp(Math.round(animatedAmount.value)))

const isHighRarity = computed(() =>
  ['epic', 'legendary', 'mythic'].includes(props.prize.rarity)
)
const isMythic = computed(() => props.prize.rarity === 'mythic')

onMounted(() => {
  // small delay so reveal animation kicks in before counting
  setTimeout(() => (target.value = props.prize.amount), 350)
})
</script>

<template>
  <div class="text-center">
    <div class="result-card" :class="[`tone-${props.prize.rarity}`, isMythic && 'mythic-aura']">
      <!-- Light rays for high rarity -->
      <div v-if="isHighRarity" class="light-rays" aria-hidden="true" />

      <!-- Floating sparkles -->
      <div v-if="isHighRarity" class="sparkle-field" aria-hidden="true">
        <span v-for="n in 12" :key="n" class="sparkle" :style="{
          left: ((n * 37) % 100) + '%',
          top: ((n * 53) % 100) + '%',
          animationDelay: (n * 0.18) + 's',
          animationDuration: (2 + (n % 3)) + 's',
        }">✦</span>
      </div>

      <!-- Icon with shockwave ring -->
      <div class="icon-wrap">
        <span class="shockwave" />
        <span class="shockwave delay-150" />
        <div class="result-icon">{{ props.prize.icon }}</div>
      </div>

      <div class="rarity-badge" :class="`rarity-${props.prize.rarity}`">
        {{ props.prize.rarity.toUpperCase() }}
      </div>

      <div class="reveal-line text-xs text-purple-300 tracking-[4px] uppercase mb-2 font-bold" style="--d: 0.1s">
        Selamat 🎉
      </div>
      <div class="reveal-line text-base text-gold mb-3 font-extrabold" style="--d: 0.2s">
        {{ props.userName }}
      </div>
      <div class="reveal-line text-xs text-purple-300 tracking-[4px] uppercase mb-2 font-bold" style="--d: 0.3s">
        Anda Mendapatkan
      </div>

      <!-- Animated amount -->
      <div class="result-amount counter">
        <span class="rp">Rp</span><span class="amt">{{ display }}</span>
      </div>

      <div class="reveal-line text-sm text-white/70 mt-3 italic" style="--d: 1.6s">
        {{ props.prize.msg }}
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mt-5 actions-stagger">
      <button class="btn-action" style="--d: 0.1s" @click="emit('share')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-[18px] h-[18px]">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
      <button class="btn-action" style="--d: 0.2s" @click="emit('download')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-[18px] h-[18px]">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download
      </button>
      <button
        class="col-span-2 mt-1 py-4 rounded-xl bg-gold-gradient text-bg-mid font-display text-lg tracking-[2px]
               shadow-[0_8px_24px_rgba(255,140,0,0.4)] active:translate-y-0.5 cursor-pointer border-0
               roll-again-pulse"
        style="--d: 0.3s"
        @click="emit('rollAgain')"
      >
        🎰 Roll Lagi
      </button>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  animation: cardEnter 0.7s cubic-bezier(0.16, 1.3, 0.3, 1) both;
}
@keyframes cardEnter {
  0%   { transform: scale(0.3) rotate(-8deg); opacity: 0; }
  60%  { transform: scale(1.06) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* Tone tints per rarity */
.tone-rare      { box-shadow: 0 25px 70px rgba(0,0,0,0.5), 0 0 60px rgba(0,150,255,0.35); }
.tone-epic      { box-shadow: 0 25px 70px rgba(0,0,0,0.5), 0 0 70px rgba(180,0,255,0.45); }
.tone-legendary { box-shadow: 0 25px 70px rgba(0,0,0,0.5), 0 0 80px rgba(255,140,0,0.55); }
.tone-mythic    { box-shadow: 0 25px 70px rgba(0,0,0,0.5), 0 0 100px rgba(255,0,110,0.6); }

.mythic-aura::after {
  background: linear-gradient(180deg, #15041a 0%, #0a0418 100%) !important;
}

/* Rotating light rays behind result */
.light-rays {
  position: absolute;
  inset: -50%;
  z-index: 0;
  background:
    repeating-conic-gradient(
      from 0deg,
      rgba(255,215,0,0.18) 0deg 6deg,
      transparent 6deg 18deg
    );
  animation: raysSpin 14s linear infinite;
  filter: blur(2px);
  opacity: 0.7;
}
@keyframes raysSpin {
  to { transform: rotate(360deg); }
}

/* Twinkling sparkles */
.sparkle-field {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.sparkle {
  position: absolute;
  font-size: 16px;
  color: #fff;
  text-shadow: 0 0 8px #ffd700;
  opacity: 0;
  animation: sparkleTwinkle ease-in-out infinite;
}
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50%      { opacity: 1; transform: scale(1.3) rotate(180deg); }
}

/* Icon with shockwave */
.icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  margin: 4px auto 12px;
}
.shockwave {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(255,215,0,0.8);
  animation: shockOut 1.4s ease-out 0.2s forwards;
  opacity: 0;
}
.shockwave.delay-150 {
  animation-delay: 0.55s;
  border-color: rgba(255,140,0,0.8);
}
@keyframes shockOut {
  0%   { transform: scale(0.5); opacity: 1; border-width: 4px; }
  100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
}

/* Staggered text reveal */
.reveal-line {
  opacity: 0;
  animation: revealLine 0.5s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0s) forwards;
}
@keyframes revealLine {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.counter {
  animation: counterEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
}
@keyframes counterEnter {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}

/* Action buttons stagger in */
.actions-stagger > * {
  opacity: 0;
  animation: revealLine 0.4s ease-out var(--d, 0s) forwards;
  animation-delay: calc(var(--d, 0s) + 1.5s);
}

.roll-again-pulse {
  position: relative;
  overflow: hidden;
}
.roll-again-pulse::before {
  content: '';
  position: absolute;
  top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(110deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shineMove 3s linear infinite;
}
@keyframes shineMove {
  0% { left: -120%; }
  60%, 100% { left: 120%; }
}
</style>
