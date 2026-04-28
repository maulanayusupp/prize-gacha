<script setup lang="ts">
const { isMuted, isStarted, toggleMute } = useGachaBGM()
</script>

<template>
  <button
    type="button"
    class="mute-btn"
    :class="{ 'is-muted': isMuted, 'is-playing': isStarted && !isMuted }"
    :aria-label="isMuted ? 'Unmute background music' : 'Mute background music'"
    :title="isMuted ? 'Unmute musik' : 'Mute musik'"
    @click="toggleMute"
  >
    <svg v-if="!isMuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <line x1="22" y1="9" x2="16" y2="15"/>
      <line x1="16" y1="9" x2="22" y2="15"/>
    </svg>
    <span v-if="isStarted && !isMuted" class="pulse-dot" />
  </button>
</template>

<style scoped>
.mute-btn {
  position: fixed;
  top: max(env(safe-area-inset-top, 0px), 14px);
  right: max(env(safe-area-inset-right, 0px), 14px);
  z-index: 50;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 215, 0, 0.35);
  background: rgba(26, 11, 46, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffd24a;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), inset 0 0 12px rgba(255, 215, 0, 0.08);
}
.mute-btn:hover {
  transform: scale(1.06);
  background: rgba(45, 27, 78, 0.75);
  border-color: rgba(255, 215, 0, 0.6);
}
.mute-btn:active {
  transform: scale(0.96);
}
.mute-btn.is-muted {
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.2);
}
.mute-btn svg {
  width: 20px;
  height: 20px;
}
.pulse-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffd24a;
  box-shadow: 0 0 8px #ffd24a;
  animation: pulseDot 1.6s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 0.55; transform: scale(0.85); }
  50%      { opacity: 1;    transform: scale(1.1); }
}
</style>
