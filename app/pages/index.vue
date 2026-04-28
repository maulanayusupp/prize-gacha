<script setup lang="ts">
import confetti from 'canvas-confetti'
import type { Prize, Rarity } from '~/types/gacha'

const { public: { siteUrl, siteName } } = useRuntimeConfig()

const pageTitle = 'Prize Gacha — Roll Your Fortune, Menangkan Hadiah Gacha Virtual'
const pageDescription =
  'Putar mesin gacha online, raih hadiah dari rarity Common, Rare, Epic, Legendary, sampai Mythic. Gratis dimainkan langsung di browser, tanpa unduh, tanpa daftar.'
const ogImage = `${siteUrl}/og-image.png`
const ogImageAlt = 'Prize Gacha — Roll Your Fortune. Mesin gachapon dengan hadiah Common hingga Mythic.'

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  twitterTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  twitterDescription: pageDescription,
  ogUrl: siteUrl,
  ogImage,
  ogImageAlt,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  twitterImage: ogImage,
  twitterImageAlt: ogImageAlt,
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': `${siteUrl}/#webapp`,
            name: siteName,
            alternateName: 'PrizeGacha',
            url: siteUrl,
            description: pageDescription,
            applicationCategory: 'GameApplication',
            applicationSubCategory: 'Casual Game',
            operatingSystem: 'Any',
            inLanguage: 'id-ID',
            isAccessibleForFree: true,
            browserRequirements: 'Requires JavaScript and a modern browser.',
            genre: ['Gacha', 'Lucky Draw', 'Casual'],
            featureList: [
              'Putar mesin gacha online',
              'Enam tingkat rarity: Common, Uncommon, Rare, Epic, Legendary, Mythic',
              'Hadiah uang virtual',
              'Bagikan hasil gacha sebagai gambar',
              'Gratis dan tanpa instalasi',
            ],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
            },
            image: ogImage,
            screenshot: ogImage,
            publisher: { '@id': `${siteUrl}/#org` },
          },
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            description: pageDescription,
            inLanguage: 'id-ID',
            publisher: { '@id': `${siteUrl}/#org` },
          },
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#org`,
            name: siteName,
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/icon-512.png`,
              width: 512,
              height: 512,
            },
          },
        ],
      }),
    },
  ],
})

const {
  userName,
  currentScreen,
  currentPrize,
  formatRp,
  setUser,
  finishRoll,
  rollAgain,
} = useGacha()
const { shareImage, downloadImage } = useShare()
const bgm = useGachaBGM()

function handleNameSubmit(name: string) {
  const ok = setUser(name)
  if (ok) bgm.start()
  return ok
}

const machineRef = ref<{ roll: () => void; buildReel: () => void } | null>(null)
const toast = ref({ msg: '', show: false })

function showToast(msg: string) {
  toast.value = { msg, show: true }
  setTimeout(() => (toast.value.show = false), 2200)
}

function fireConfetti(rarity: Rarity) {
  const intensity = ({ common: 0.6, uncommon: 0.8, rare: 1, epic: 1.4, legendary: 2, mythic: 3 } as const)[rarity]
  const colors = ({
    common: ['#cccccc', '#ffffff'],
    uncommon: ['#00c864', '#6fffaa', '#ffffff'],
    rare: ['#0096ff', '#6fc8ff', '#ffffff'],
    epic: ['#b400ff', '#d68fff', '#ffd700'],
    legendary: ['#ff8c00', '#ffd700', '#fff700'],
    mythic: ['#ff006e', '#8338ec', '#3a86ff', '#ffd700', '#ffffff'],
  } as const)[rarity]

  const palette = [...colors]
  const count = Math.floor(150 * intensity)

  // Initial center burst
  confetti({ particleCount: count, spread: 90, origin: { y: 0.55 }, colors: palette, ticks: 280, scalar: 1.1 })

  // Side cannons
  setTimeout(() => {
    confetti({ particleCount: count / 2, spread: 120, angle: 60, origin: { x: 0, y: 0.7 }, colors: palette })
    confetti({ particleCount: count / 2, spread: 120, angle: 120, origin: { x: 1, y: 0.7 }, colors: palette })
  }, 250)

  // Big finale for legendary+
  if (rarity === 'legendary' || rarity === 'mythic') {
    setTimeout(() => {
      confetti({ particleCount: 200, spread: 360, startVelocity: 55, origin: { y: 0.5 }, colors: palette, scalar: 1.4 })
    }, 600)
  }

  // Sustained shower for mythic — 3 seconds of continuous rain
  if (rarity === 'mythic') {
    const end = Date.now() + 3000
    const shower = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.4 }, colors: palette, scalar: 0.9 })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.4 }, colors: palette, scalar: 0.9 })
      if (Date.now() < end) requestAnimationFrame(shower)
    }
    setTimeout(shower, 900)
  }
}

function onRolled(prize: Prize) {
  finishRoll()
  // wait for transition to result screen, then fire confetti
  nextTick(() => fireConfetti(prize.rarity))
}

async function handleShare() {
  if (!currentPrize.value) return
  const prize = currentPrize.value
  const text = `🎉 Saya ${userName.value} mendapatkan Rp ${formatRp(prize.amount)} di Prize Gacha! Cobain juga yuk!`
  try {
    const result = await shareImage(prize, userName.value, text)
    if (result === 'shared-with-image') showToast('✅ Berhasil dibagikan!')
    else if (result === 'shared-text-only') showToast('✅ Teks dibagikan')
    else if (result === 'copied-and-downloaded') showToast('📋 Teks disalin & gambar diunduh')
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      console.error('share error:', e)
      showToast('⚠️ Gagal share, coba Download')
    }
  }
}

async function handleDownload() {
  if (!currentPrize.value) return
  try {
    const safe = userName.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'player'
    await downloadImage(currentPrize.value, userName.value, `prize-gacha-${safe}-${currentPrize.value.amount}.png`)
    showToast('💾 Gambar berhasil disimpan!')
  } catch (e) {
    console.error('download error:', e)
    showToast('⚠️ Gagal mengunduh')
  }
}

</script>

<template>
  <div class="relative h-screen flex items-center justify-center">
    <BackgroundFx />

    <main class="relative z-10 w-full max-w-[480px] p-5">
      <Transition name="screen" mode="out-in">
        <NameForm
          v-if="currentScreen === 'name'"
          key="name"
          @submit="handleNameSubmit"
        />

        <GachaMachine
          v-else-if="currentScreen === 'gacha'"
          key="gacha"
          ref="machineRef"
          :user-name="userName"
          @rolled="onRolled"
        />

        <ResultCard
          v-else-if="currentScreen === 'result' && currentPrize"
          key="result"
          :prize="currentPrize"
          :user-name="userName"
          @roll-again="rollAgain"
          @share="handleShare"
          @download="handleDownload"
        />
      </Transition>
    </main>

    <div
      class="aurora"
      :class="{ show: currentScreen === 'result' && currentPrize && ['epic','legendary','mythic'].includes(currentPrize.rarity) }"
    />

    <div class="toast" :class="{ show: toast.show }">{{ toast.msg }}</div>

    <MuteButton />
  </div>
</template>
