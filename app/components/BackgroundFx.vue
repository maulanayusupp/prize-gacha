<script setup lang="ts">
const coins = ref<{ id: number; left: number; size: number; duration: number; icon: string }[]>([])
let nextId = 0
let timer: ReturnType<typeof setInterval> | null = null

const ICONS = ['💰', '💵', '🪙', '💎', '✨']

function spawnCoin() {
  const id = nextId++
  coins.value.push({
    id,
    left: Math.random() * 100,
    size: 16 + Math.random() * 24,
    duration: 6 + Math.random() * 6,
    icon: ICONS[Math.floor(Math.random() * ICONS.length)]!,
  })
  if (coins.value.length > 25) coins.value.shift()
}

onMounted(() => {
  timer = setInterval(spawnCoin, 800)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div>
    <div class="stars" />
    <div class="stars2" />
    <div class="stars3" />
    <div
      v-for="c in coins"
      :key="c.id"
      class="float-coin"
      :style="{
        left: c.left + 'vw',
        fontSize: c.size + 'px',
        animationDuration: c.duration + 's',
      }"
    >
      {{ c.icon }}
    </div>
  </div>
</template>
