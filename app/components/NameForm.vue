<script setup lang="ts">
const emit = defineEmits<{ submit: [name: string] }>()
const { getNameUnlockAt, refreshUsedNames } = useGacha()

const name = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const now = ref(Date.now())

let tickHandle: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  inputRef.value?.focus()
  refreshUsedNames()
  tickHandle = setInterval(() => (now.value = Date.now()), 1000)
})

onUnmounted(() => {
  if (tickHandle) clearInterval(tickHandle)
})

const trimmed = computed(() => name.value.trim())
const unlockAt = computed(() => (trimmed.value ? getNameUnlockAt(trimmed.value) : null))
const remainingMs = computed(() =>
  unlockAt.value !== null ? Math.max(0, unlockAt.value - now.value) : 0,
)
const isLocked = computed(() => remainingMs.value > 0)

const remainingLabel = computed(() => {
  const ms = remainingMs.value
  if (ms <= 0) return ''
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s} detik`
  return `${m} menit ${s.toString().padStart(2, '0')} detik`
})

const valid = computed(() => trimmed.value.length >= 2 && !isLocked.value)

function submit() {
  if (!valid.value) return
  emit('submit', trimmed.value)
}
</script>

<template>
  <section class="card text-center p-8 sm:p-10 bg-gradient-to-br from-gold/10 to-purple-600/10 border-2 border-gold/30 rounded-3xl backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
    <div class="card-shine" />
    <div class="text-7xl mb-4 coin-bounce stagger" style="--d: 0s">💰</div>
    <h1 class="logo-text stagger" style="--d: 0.1s">Prize Gacha</h1>
    <div class="text-sm tracking-[6px] text-purple-300 uppercase font-semibold mt-2 mb-8 stagger" style="--d: 0.2s">
      Roll Your Fortune
    </div>

    <label for="username" class="block text-left text-xs text-gold mb-2 font-semibold tracking-wider uppercase stagger" style="--d: 0.3s">
      Masukkan Nama Anda
    </label>
    <div class="stagger" style="--d: 0.35s">
      <input
        id="username"
        ref="inputRef"
        v-model="name"
        type="text"
        placeholder="Nama lengkap..."
        maxlength="24"
        autocomplete="off"
        class="name-input"
        :class="{ 'name-input--error': isLocked }"
        @keydown.enter="submit"
      >
    </div>

    <p
      v-if="isLocked"
      class="mt-3 text-xs text-rose-300 font-semibold leading-relaxed"
      role="alert"
    >
      Nama "<span class="font-bold">{{ trimmed }}</span>" sudah dipakai.<br>
      Coba lagi dalam <span class="text-rose-200 font-bold tabular-nums">{{ remainingLabel }}</span>
      atau pakai nama lain.
    </p>

    <button
      class="btn-primary mt-6 stagger"
      style="--d: 0.45s"
      :disabled="!valid"
      @click="submit"
    >
      Mulai Gacha
    </button>

    <p class="mt-5 text-xs text-white/50 stagger" style="--d: 0.55s">
      ✨ Coba peruntungan Anda hari ini! ✨
    </p>
    <p class="mt-2 text-[10px] text-white/35 tracking-wider uppercase stagger" style="--d: 0.6s">
      1 nama hanya bisa roll 1x per jam
    </p>
  </section>
</template>

<style scoped>
.stagger {
  opacity: 0;
  animation: staggerIn 0.6s cubic-bezier(0.16, 1.2, 0.3, 1) var(--d, 0s) forwards;
}
@keyframes staggerIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-shine {
  position: absolute;
  top: -100%; left: -50%;
  width: 200%; height: 100%;
  background: linear-gradient(110deg, transparent 40%, rgba(255,215,0,0.08) 50%, transparent 60%);
  animation: cardShine 6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes cardShine {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(150%); }
}

.name-input--error {
  border-color: rgba(244, 63, 94, 0.7) !important;
  box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
}
</style>
