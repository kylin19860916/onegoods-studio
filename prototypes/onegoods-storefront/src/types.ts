export type Lang = 'zh' | 'tw' | 'en'
export type Currency = 'CNY' | 'TWD' | 'AUD'
export type Screen = 'home' | 'shop' | 'detail' | 'cart' | 'about'

/** A per-language string bundle. */
export type L10n = Record<Lang, string>

export interface RawProduct {
  id: string
  nm: L10n
  price: number
  oldPrice: number
  tile: string
  colors: string[]
  badge: string
  badgeBg: string
  badgeColor?: string
}

export interface CartItem {
  id: string
  qty: number
  ci: number
}
