import type { CSSProperties } from 'react'
import { useStore } from '../store'
import ProductCard from '../components/ProductCard'

const chip = (bg: string, color = '#2E2A24'): CSSProperties => ({
  padding: '9px 18px',
  borderRadius: 999,
  background: bg,
  color,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
})

export default function Shop() {
  const s = useStore()
  const { t } = s

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '36px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: '#9a958c', margin: '0 0 6px' }}>{t.shopEyebrow}</p>
          <h1 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 38, margin: 0 }}>
            Shop All <span style={{ fontSize: 15, color: '#9a958c', fontWeight: 500 }}>· {s.products.length} {t.shopItems}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(43,43,43,.08)', borderRadius: 999, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{t.shopSort}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '24px 0 28px' }}>
        <span style={chip('#2E2A24', '#fff')}>{t.f1}</span>
        <span style={chip('#E7EFE4')}>{t.f2}</span>
        <span style={chip('#F4EAD1')}>{t.f3}</span>
        <span style={chip('#E5EBED')}>{t.f4}</span>
        <span style={chip('#ECE5EF')}>{t.f5}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        {s.products.map((p) => (
          <ProductCard key={p.id} p={p} slotId={p.slotShop} />
        ))}
      </div>
    </main>
  )
}
