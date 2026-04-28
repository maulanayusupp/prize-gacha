export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Prize {
  amount: number
  rarity: Rarity
  icon: string
  msg: string
  weight: number
}
