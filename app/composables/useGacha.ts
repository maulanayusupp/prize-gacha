import type { Prize, Rarity } from '~/types/gacha'

// Prize table.
// `weight` 0 = display-only (muncul di reel sebagai dekorasi tapi tidak akan
// pernah dimenangkan). pickPrize() melewati item ber-weight 0 secara alami.
//
// Probabilitas menang aktual (total weight = 100):
//   • 5.000 – 10.000  → 95%   (5k=50, 10k=45)
//   • 10.001 – 20.000 → 2%    (15k=1, 20k=1)
//   • 30.000          → 1%
//   • Filler kecil    → 2%    (1k=1, 2.5k=1)
//   • > 30.000        → 0%    (display only)
const PRIZES: Prize[] = [
  // ===== Bisa dimenangkan =====
  { amount: 1000,      rarity: 'common',    icon: '🪙', msg: 'Yah, lumayan buat parkir~',  weight: 1 },
  { amount: 2500,      rarity: 'common',    icon: '🪙', msg: 'Cukup buat es teh!',         weight: 1 },
  { amount: 5000,      rarity: 'common',    icon: '💵', msg: 'Beli gorengan yuk!',         weight: 50 },
  { amount: 10000,     rarity: 'uncommon',  icon: '💵', msg: 'Sebungkus nasi padang!',     weight: 45 },
  { amount: 15000,     rarity: 'uncommon',  icon: '💵', msg: 'Lumayan, 15rb!',             weight: 1 },
  { amount: 20000,     rarity: 'uncommon',  icon: '💵', msg: 'Cukup buat ngopi 20rb~',     weight: 1 },
  { amount: 30000,     rarity: 'uncommon',  icon: '💵', msg: 'Mantap, 30rb!',              weight: 1 },

  // ===== Display only — tidak akan pernah dimenangkan (weight 0) =====
  { amount: 25000,     rarity: 'uncommon',  icon: '💵', msg: 'Cukup buat makan siang~',    weight: 0 },
  { amount: 50000,     rarity: 'rare',      icon: '💴', msg: 'Mantap, top up game nih!',   weight: 0 },
  { amount: 100000,    rarity: 'rare',      icon: '💴', msg: 'Wow, satu lembar merah!',    weight: 0 },
  { amount: 250000,    rarity: 'epic',      icon: '💶', msg: 'Lumayan buat skincare 💅',  weight: 0 },
  { amount: 500000,    rarity: 'epic',      icon: '💷', msg: 'Bisa beli sepatu baru!',     weight: 0 },
  { amount: 1000000,   rarity: 'legendary', icon: '💎', msg: 'SEJUTA! Traktiran wajib!',   weight: 0 },
  { amount: 5000000,   rarity: 'legendary', icon: '💎', msg: 'Beli HP baru! 📱',           weight: 0 },
  { amount: 10000000,  rarity: 'mythic',    icon: '👑', msg: 'MYTHIC! Tabungan berlipat!', weight: 0 },
  { amount: 100000000, rarity: 'mythic',    icon: '🏆', msg: 'JACKPOT! DP RUMAH! 🏠',      weight: 0 },
]

type Screen = 'name' | 'gacha' | 'result'

export const NAME_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour
const USED_NAMES_KEY = 'mg_used_names'

type UsedName = { name: string; at: number }

const userName = ref('')
const currentScreen = ref<Screen>('name')
const currentPrize = ref<Prize | null>(null)
const isRolling = ref(false)
const rollHistory = ref<Prize[]>([])
const usedNames = ref<UsedName[]>([])

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

function loadUsedNames(): UsedName[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(USED_NAMES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UsedName[]
    const now = Date.now()
    return parsed.filter(u => u && typeof u.name === 'string' && typeof u.at === 'number' && now - u.at < NAME_COOLDOWN_MS)
  } catch {
    return []
  }
}

function saveUsedNames(list: UsedName[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(USED_NAMES_KEY, JSON.stringify(list))
}

export function useGacha() {
  const formatRp = (n: number) => n.toLocaleString('id-ID')

  function pickPrize(): Prize {
    const total = PRIZES.reduce((s, p) => s + p.weight, 0)
    let r = Math.random() * total
    for (const p of PRIZES) {
      if ((r -= p.weight) <= 0) return p
    }
    return PRIZES[0]!
  }

  function refreshUsedNames() {
    usedNames.value = loadUsedNames()
  }

  function getNameUnlockAt(name: string): number | null {
    const key = normalizeName(name)
    if (!key) return null
    const found = loadUsedNames().find(u => u.name === key)
    if (!found) return null
    return found.at + NAME_COOLDOWN_MS
  }

  function recordName(name: string) {
    const key = normalizeName(name)
    if (!key) return
    const now = Date.now()
    const list = loadUsedNames().filter(u => u.name !== key)
    list.push({ name: key, at: now })
    saveUsedNames(list)
    usedNames.value = list
  }

  function setUser(name: string): boolean {
    const trimmed = name.trim()
    if (getNameUnlockAt(trimmed) !== null) return false
    userName.value = trimmed
    currentScreen.value = 'gacha'
    return true
  }

  function startRoll(): Prize {
    const prize = pickPrize()
    currentPrize.value = prize
    isRolling.value = true
    return prize
  }

  function finishRoll() {
    isRolling.value = false
    if (currentPrize.value) rollHistory.value.unshift(currentPrize.value)
    if (userName.value) recordName(userName.value)
    currentScreen.value = 'result'
  }

  function rollAgain() {
    userName.value = ''
    currentPrize.value = null
    currentScreen.value = 'name'
  }

  function reset() {
    userName.value = ''
    currentPrize.value = null
    rollHistory.value = []
    currentScreen.value = 'name'
  }

  return {
    PRIZES,
    userName: readonly(userName),
    currentScreen: readonly(currentScreen),
    currentPrize: readonly(currentPrize),
    isRolling: readonly(isRolling),
    rollHistory: readonly(rollHistory),
    usedNames: readonly(usedNames),
    formatRp,
    pickPrize,
    setUser,
    startRoll,
    finishRoll,
    rollAgain,
    reset,
    getNameUnlockAt,
    recordName,
    refreshUsedNames,
  }
}

export type { Prize, Rarity, Screen }
