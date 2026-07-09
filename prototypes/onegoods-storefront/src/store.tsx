import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, Currency, Lang, RawProduct, Screen } from './types'
import { COLOR_NAMES, PRODUCTS } from './data'
import { STRINGS } from './i18n'

/* ---------------------------------------------------------------- currency */

const CURRENCIES: Record<Currency, { s: string; r: number }> = {
  CNY: { s: '¥', r: 1 },
  TWD: { s: 'NT$', r: 4.4 },
  AUD: { s: 'AU$', r: 0.21 },
}

/** Language → linked currency (简→¥, 繁→NT$, EN→AU$). */
const LANG_CURRENCY: Record<Lang, Currency> = { zh: 'CNY', tw: 'TWD', en: 'AUD' }

/* --------------------------------------------------------- persistence read */

function initialLang(): Lang {
  try {
    const l = localStorage.getItem('og-lang')
    if (l === 'zh' || l === 'tw' || l === 'en') return l
  } catch {
    /* ignore */
  }
  return 'zh'
}

function initialCurrency(): Currency {
  try {
    const c = localStorage.getItem('og-cur')
    if (c === 'CNY' || c === 'TWD' || c === 'AUD') return c
  } catch {
    /* ignore */
  }
  return 'CNY'
}

/* ------------------------------------------------------- decorated products */

export interface DecoratedProduct extends RawProduct {
  hasBadge: boolean
  priceFmt: string
  oldPriceFmt: string
  cn: string
  en: string
  colorNames: string[]
  badgeStyle: string
  badgeChip: string
  slot: string
  slotShop: string
  slotRel: string
  slotCart: string
  onOpen: () => void
  onAdd: (e?: { stopPropagation?: () => void }) => void
}

export interface Store {
  // raw state
  screen: Screen
  lang: Lang
  currency: Currency
  cart: CartItem[]
  detailId: string
  qty: number
  colorIndex: number
  // derived
  t: Record<string, string>
  sloganFont: string
  fmt: (n: number) => string
  products: DecoratedProduct[]
  byId: (id: string) => DecoratedProduct
  cartCount: number
  // actions
  setLang: (l: Lang) => void
  setCur: (c: Currency) => void
  go: (screen: Screen) => void
  open: (id: string) => void
  add: (id: string) => void
  setQty: (n: number) => void
  setColorIndex: (i: number) => void
  incLine: (id: string) => void
  decLine: (id: string) => void
  removeLine: (id: string) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency)
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'puck', qty: 1, ci: 0 },
    { id: 'flower', qty: 2, ci: 0 },
  ])
  const [detailId, setDetailId] = useState('puck')
  const [qty, setQtyState] = useState(1)
  const [colorIndex, setColorIndex] = useState(0)

  const setLang = useCallback((l: Lang) => {
    const c = LANG_CURRENCY[l] ?? 'CNY'
    try {
      localStorage.setItem('og-lang', l)
      localStorage.setItem('og-cur', c)
    } catch {
      /* ignore */
    }
    setLangState(l)
    setCurrencyState(c)
  }, [])

  const setCur = useCallback((c: Currency) => {
    try {
      localStorage.setItem('og-cur', c)
    } catch {
      /* ignore */
    }
    setCurrencyState(c)
  }, [])

  const go = useCallback((s: Screen) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }, [])

  const open = useCallback((id: string) => {
    setDetailId(id)
    setQtyState(1)
    setColorIndex(0)
    setScreen('detail')
    window.scrollTo(0, 0)
  }, [])

  const add = useCallback((id: string) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.id === id)
      if (i >= 0) {
        const next = prev.slice()
        next[i] = { ...next[i], qty: next[i].qty + 1 }
        return next
      }
      return [...prev, { id, qty: 1, ci: 0 }]
    })
  }, [])

  const incLine = useCallback((id: string) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)))
  }, [])
  const decLine = useCallback((id: string) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty - 1) } : c)))
  }, [])
  const removeLine = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const fmt = useCallback(
    (n: number) => {
      const c = CURRENCIES[currency] ?? CURRENCIES.CNY
      return c.s + Math.round(n * c.r)
    },
    [currency],
  )

  // translated strings for the active language, with {amt} substitution
  const t = useMemo(() => {
    const out: Record<string, string> = {}
    for (const k in STRINGS) out[k] = STRINGS[k][lang]
    const amt = fmt(99)
    out.tr1 = out.tr1.replace('{amt}', amt)
    out.payNote = out.payNote.replace('{amt}', amt)
    return out
  }, [lang, fmt])

  const sloganFont =
    lang === 'tw'
      ? "'LXGW WenKai TC','PingFang TC','Microsoft JhengHei',cursive"
      : "'ZCOOL KuaiLe',cursive"

  const products = useMemo<DecoratedProduct[]>(() => {
    return PRODUCTS.map((p) => {
      const bg = p.badgeBg || '#fff'
      const badgeColor = p.badgeColor || '#2E2A24'
      return {
        ...p,
        hasBadge: !!p.badge,
        priceFmt: fmt(p.price),
        oldPriceFmt: fmt(p.oldPrice),
        cn: p.nm[lang],
        en: lang === 'en' ? '' : p.nm.en,
        colorNames: p.colors.map((c) => (COLOR_NAMES[c] ? COLOR_NAMES[c][lang] : '')),
        badgeStyle: `position:absolute;top:10px;left:10px;padding:5px 11px;border-radius:999px;background:${bg};color:${badgeColor};font-size:10px;font-weight:700;letter-spacing:.5px;box-shadow:0 4px 10px rgba(43,43,43,.12)`,
        badgeChip: `padding:6px 12px;border-radius:999px;background:${bg};color:${badgeColor};font-size:11px;font-weight:700;letter-spacing:.5px`,
        slot: 'og-h-' + p.id,
        slotShop: 'og-s-' + p.id,
        slotRel: 'og-r-' + p.id,
        slotCart: 'og-c-' + p.id,
        onOpen: () => open(p.id),
        onAdd: (e?: { stopPropagation?: () => void }) => {
          e?.stopPropagation?.()
          add(p.id)
        },
      }
    })
  }, [lang, fmt, open, add])

  const byId = useCallback((id: string) => products.find((p) => p.id === id)!, [products])

  const cartCount = cart.reduce((a, c) => a + c.qty, 0)

  const value: Store = {
    screen,
    lang,
    currency,
    cart,
    detailId,
    qty,
    colorIndex,
    t,
    sloganFont,
    fmt,
    products,
    byId,
    cartCount,
    setLang,
    setCur,
    go,
    open,
    add,
    setQty: setQtyState,
    setColorIndex,
    incLine,
    decLine,
    removeLine,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
