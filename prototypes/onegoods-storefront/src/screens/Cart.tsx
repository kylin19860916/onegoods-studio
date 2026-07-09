import { useStore } from '../store'
import ImageSlot from '../components/ImageSlot'
import { BagIcon, CouponIcon } from '../components/Icons'

export default function Cart() {
  const s = useStore()
  const { t } = s

  const lines = s.cart.map((item) => {
    const p = s.byId(item.id)
    const colorName = p.colorNames[item.ci || 0]
    return {
      id: item.id,
      cn: p.cn,
      meta: (p.en ? p.en + ' · ' : '') + colorName,
      tile: p.tile,
      qty: item.qty,
      slotCart: p.slotCart,
      lineTotal: p.price * item.qty,
      lineTotalFmt: s.fmt(p.price * item.qty),
    }
  })
  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0)
  const shippingFree = subtotal >= 99 || subtotal === 0
  const shippingLabel = shippingFree ? t.freeShip : s.fmt(8)

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 32px 80px' }}>
      <h1 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 34, margin: '0 0 24px' }}>
        {t.cartTitle} <span style={{ fontSize: 15, color: '#9a958c', fontWeight: 500 }}>· {s.cartCount} {t.unit}</span>
      </h1>

      {s.cart.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lines.map((l) => (
              <div key={l.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#fff', borderRadius: 22, padding: 16, border: '1px solid rgba(43,43,43,.05)' }}>
                <div style={{ width: 84, height: 84, borderRadius: 16, overflow: 'hidden', background: l.tile, flexShrink: 0 }}>
                  <ImageSlot id={l.slotCart} radius={16} placeholder="" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: 16, margin: 0 }}>{l.cn}</h3>
                  <p style={{ fontSize: 12, color: '#9a958c', margin: '3px 0 0' }}>{l.meta}</p>
                  <button className="h-remove" onClick={() => s.removeLine(l.id)} style={{ background: 'none', border: 'none', color: '#c4bfb5', fontSize: 12, cursor: 'pointer', padding: '6px 0 0' }}>{t.remove}</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F3EBDA', borderRadius: 999, padding: '6px 8px' }}>
                  <button onClick={() => s.decLine(l.id)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{l.qty}</span>
                  <button onClick={() => s.incLine(l.id)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
                <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 17, minWidth: 64, textAlign: 'right' }}>{l.lineTotalFmt}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid rgba(43,43,43,.05)', boxShadow: '0 14px 40px -24px rgba(43,43,43,.28)', position: 'sticky', top: 100 }}>
            <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 18px' }}>{t.summary}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b665e', marginBottom: 12 }}>
              <span>{t.subtotalLabel}</span>
              <span>{s.fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b665e', marginBottom: 12 }}>
              <span>{t.shippingWord}</span>
              <span>{shippingLabel}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
              <div style={{ flex: 1, background: '#F3EBDA', borderRadius: 12, padding: '11px 14px', fontSize: 13, color: '#9a958c', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CouponIcon size={16} color="#9a958c" />
                {t.coupon}
              </div>
              <button style={{ background: '#2E2A24', color: '#fff', border: 'none', borderRadius: 12, padding: '0 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.use}</button>
            </div>
            <div style={{ height: 1, background: 'rgba(43,43,43,.08)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <span style={{ fontWeight: 600 }}>{t.total}</span>
              <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 26, color: '#EF6A55' }}>{s.fmt(subtotal)}</span>
            </div>
            <button className="h-coral" style={{ width: '100%', background: '#EF6A55', color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 24px -8px rgba(239,106,85,.6)' }}>{t.checkout} →</button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#c4bfb5', margin: '14px 0 0' }}>{t.payNote}</p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <BagIcon size={52} color="#EF6A55" />
          </div>
          <h2 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 22, margin: '16px 0 6px' }}>{t.emptyT}</h2>
          <p style={{ fontSize: 14, color: '#9a958c', margin: '0 0 24px' }}>{t.emptyS}</p>
          <button onClick={() => s.go('shop')} style={{ background: '#EF6A55', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{t.emptyBtn}</button>
        </div>
      )}
    </main>
  )
}
