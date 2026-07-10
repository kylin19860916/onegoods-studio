import type { L10n, RawProduct } from './types'

// Brand palette (warm handcraft family)
export const COLORS = {
  coral: '#EF6A55',
  butter: '#FFD86B',
  mint: '#A7E6C6',
  sky: '#B6DDF7',
  clay: '#E8C4AB',
  lav: '#C0B7F6',
  charcoal: '#2E2A24',
} as const

const { coral, butter, mint, sky, clay, lav, charcoal } = COLORS

/** Localized colour names, keyed by hex. */
export const COLOR_NAMES: Record<string, L10n> = {
  [mint]: { zh: '薄荷绿', tw: '薄荷綠', en: 'Mint' },
  [clay]: { zh: '陶土', tw: '陶土', en: 'Clay' },
  [sky]: { zh: '天空蓝', tw: '天空藍', en: 'Sky' },
  [butter]: { zh: '奶油黄', tw: '奶油黃', en: 'Butter' },
  [coral]: { zh: '珊瑚红', tw: '珊瑚紅', en: 'Coral' },
  [lav]: { zh: '薰衣草', tw: '薰衣草', en: 'Lavender' },
  [charcoal]: { zh: '炭黑', tw: '炭黑', en: 'Charcoal' },
}

export const PRODUCTS: RawProduct[] = [
  { id: 'puck',   nm: { zh: '解压泡泡饼', tw: '解壓泡泡餅', en: 'Fidget Puck' },   price: 39, oldPrice: 59, tile: '#E7EFE4', colors: [mint, clay, sky],     badge: 'BESTSELLER', badgeBg: mint },
  { id: 'blob',   nm: { zh: '软软小团子', tw: '軟軟小團子', en: 'Squishy Blob' },   price: 29, oldPrice: 45, tile: '#F4EAD1', colors: [butter, coral, mint], badge: 'NEW',        badgeBg: lav },
  { id: 'flower', nm: { zh: '小花挂饰',   tw: '小花掛飾',   en: 'Bloom Charm' },    price: 45, oldPrice: 69, tile: '#F5E6DB', colors: [coral, butter, lav],  badge: 'LIMITED',    badgeBg: clay },
  { id: 'ring',   nm: { zh: '圆环挂饰',   tw: '圓環掛飾',   en: 'Charm Ring' },     price: 35, oldPrice: 52, tile: '#E5EBED', colors: [sky, mint, clay],     badge: '3D PRINTED', badgeBg: sky },
  { id: 'clip',   nm: { zh: '迷你工具夹', tw: '迷你工具夾', en: 'Mini Tool Clip' }, price: 49, oldPrice: 69, tile: '#EFE7D9', colors: [clay, charcoal, sky], badge: '',           badgeBg: '' },
  { id: 'block',  nm: { zh: '模块积木',   tw: '模塊積木',   en: 'Modular Block' },  price: 59, oldPrice: 79, tile: '#ECE5EF', colors: [lav, sky, coral],     badge: 'REMIXED',    badgeBg: coral, badgeColor: '#fff' },
  { id: 'gear',   nm: { zh: '齿轮陀螺',   tw: '齒輪陀螺',   en: 'Gear Spinner' },   price: 42, oldPrice: 58, tile: '#E7EFE4', colors: [mint, butter, clay],  badge: '',           badgeBg: '' },
  { id: 'loop',   nm: { zh: '钥匙扣套装', tw: '鑰匙扣套裝', en: 'Keychain Loop' },  price: 32, oldPrice: 48, tile: '#E5EBED', colors: [sky, coral, lav],     badge: 'BESTSELLER', badgeBg: mint },
]
