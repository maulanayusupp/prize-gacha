<script setup lang="ts">
import { verifySerial, type VerifyResult } from '~/composables/useShareCard'

const { public: { siteName } } = useRuntimeConfig()

useSeoMeta({
  title: 'Verify — Prize Gacha',
  description:
    'Verifikasi keaslian gambar hasil Prize Gacha. Masukkan nama, hadiah, dan serial code untuk cek apakah gambar asli atau palsu.',
  robots: 'noindex, follow',
})

const name = ref('')
const amountInput = ref('')
const serial = ref('')
const result = ref<VerifyResult | null>(null)
const checking = ref(false)

const cleanAmount = computed(() => {
  const n = parseInt(amountInput.value.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : NaN
})

const canCheck = computed(() =>
  name.value.trim().length >= 2 &&
  Number.isFinite(cleanAmount.value) &&
  cleanAmount.value > 0 &&
  serial.value.trim().length > 0
)

function formatAmount(n: number) {
  return n.toLocaleString('id-ID')
}

const formattedTime = computed(() => {
  if (!result.value || !result.value.valid) return ''
  const d = new Date(result.value.timestamp)
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} · ${time}`
})

async function check() {
  if (!canCheck.value) return
  result.value = null
  checking.value = true
  try {
    result.value = await verifySerial(serial.value, name.value, cleanAmount.value)
  } finally {
    checking.value = false
  }
}

function reset() {
  name.value = ''
  amountInput.value = ''
  serial.value = ''
  result.value = null
}

// Format amount input with thousand separators while typing
watch(amountInput, (v) => {
  const digits = v.replace(/[^\d]/g, '')
  if (!digits) {
    amountInput.value = ''
    return
  }
  amountInput.value = parseInt(digits, 10).toLocaleString('id-ID')
})
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center py-10 px-5">
    <BackgroundFx />

    <main class="relative z-10 w-full max-w-[520px]">
      <section class="card text-center p-8 sm:p-10 bg-gradient-to-br from-gold/10 to-purple-600/10 border-2 border-gold/30 rounded-3xl backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div class="text-5xl mb-3">🔍</div>
        <h1 class="logo-text text-3xl sm:text-4xl">Verify</h1>
        <p class="text-sm tracking-[4px] text-purple-300 uppercase font-semibold mt-2 mb-6">
          Cek Keaslian Gambar
        </p>

        <p class="text-xs text-white/55 leading-relaxed mb-7">
          Masukkan nama, jumlah hadiah, dan kode serial dari gambar untuk
          memverifikasi keasliannya.
        </p>

        <div class="space-y-4 text-left">
          <div>
            <label class="block text-[10px] text-gold mb-1.5 font-semibold tracking-wider uppercase">Nama</label>
            <input
              v-model="name"
              type="text"
              placeholder="Nama yang tertera di gambar"
              maxlength="32"
              autocomplete="off"
              class="name-input"
              @keydown.enter="check"
            >
          </div>

          <div>
            <label class="block text-[10px] text-gold mb-1.5 font-semibold tracking-wider uppercase">Jumlah Hadiah (Rp)</label>
            <input
              v-model="amountInput"
              type="text"
              inputmode="numeric"
              placeholder="contoh: 10.000"
              autocomplete="off"
              class="name-input"
              @keydown.enter="check"
            >
          </div>

          <div>
            <label class="block text-[10px] text-gold mb-1.5 font-semibold tracking-wider uppercase">Serial Code</label>
            <input
              v-model="serial"
              type="text"
              placeholder="PG-XXXXXX-XXXXXXXX"
              autocomplete="off"
              spellcheck="false"
              class="name-input mono"
              @keydown.enter="check"
            >
          </div>
        </div>

        <button
          class="btn-primary mt-6 w-full"
          :disabled="!canCheck || checking"
          @click="check"
        >
          {{ checking ? 'Memeriksa…' : 'Verifikasi' }}
        </button>

        <Transition name="result">
          <div v-if="result" class="mt-6">
            <div
              v-if="result.valid"
              class="result-box result-valid"
            >
              <div class="text-4xl mb-2">✅</div>
              <div class="text-lg font-extrabold text-emerald-300 tracking-wide">ASLI &middot; VERIFIED</div>
              <p class="text-xs text-emerald-100/70 mt-2 leading-relaxed">
                Serial cocok dengan data ini.
              </p>
              <div class="mt-4 text-sm space-y-1">
                <div><span class="text-white/50">Nama:</span> <strong class="text-white">{{ name.trim() }}</strong></div>
                <div><span class="text-white/50">Hadiah:</span> <strong class="text-gold">Rp {{ formatAmount(cleanAmount) }}</strong></div>
                <div><span class="text-white/50">Waktu:</span> <strong class="text-white/85">{{ formattedTime }}</strong></div>
              </div>
            </div>

            <div
              v-else
              class="result-box result-invalid"
            >
              <div class="text-4xl mb-2">❌</div>
              <div class="text-lg font-extrabold text-rose-300 tracking-wide">TIDAK COCOK</div>
              <p class="text-xs text-rose-100/70 mt-2 leading-relaxed">
                <template v-if="result.reason === 'format'">
                  Format serial tidak valid. Pastikan ditulis sesuai gambar
                  (contoh: <code class="text-rose-200">PG-XXXXXX-XXXXXXXX</code>).
                </template>
                <template v-else>
                  Kombinasi nama, hadiah, dan serial tidak cocok. Cek ulang
                  ejaan nama atau angka hadiah.
                </template>
              </p>
            </div>

            <button class="text-xs text-purple-300 hover:text-gold mt-4 underline-offset-2 hover:underline" @click="reset">
              Reset & cek lagi
            </button>
          </div>
        </Transition>

        <NuxtLink
          to="/"
          class="block mt-7 text-xs text-white/45 hover:text-gold transition-colors"
        >
          ← Kembali ke {{ siteName }}
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mono {
  font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.result-box {
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1.5px solid;
  text-align: center;
}
.result-valid {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  border-color: rgba(110, 231, 183, 0.45);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);
}
.result-invalid {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.05));
  border-color: rgba(252, 165, 165, 0.45);
  box-shadow: 0 10px 30px rgba(244, 63, 94, 0.15);
}

.result-enter-active,
.result-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.result-enter-from,
.result-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
