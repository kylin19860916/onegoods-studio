import type { CSSProperties } from 'react'
import { useStore } from '../store'
import { cssToStyle } from '../css'
import ImageSlot from '../components/ImageSlot'
import { BagIcon, BoxIcon, PlayIcon, ShieldIcon, SmileyIcon, TruckIcon } from '../components/Icons'

const thumb: CSSProperties = { width: 76, height: 76, borderRadius: 16, overflow: 'hidden', position: 'relative' }

const relCard: CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: 14,
  cursor: 'pointer',
  boxShadow: '0 10px 30px -18px rgba(43,43,43,.28)',
  border: '1px solid rgba(43,43,43,.04)',
}

const trustBox: CSSProperties = { background: '#fff', borderRadius: 16, padding: 14, textAlign: 'center', border: '1px solid rgba(43,43,43,.05)' }

const stepBtn: CSSProperties = { width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#EFE6D6', fontSize: 18, cursor: 'pointer' }

export default function Detail() {
  const s = useStore()
  const { t } = s
  const detail = s.byId(s.detailId)
  const related = s.products.filter((p) => p.id !== s.detailId).slice(0, 4)

  const addDetail = () => {
    for (let k = 0; k < s.qty; k++) s.add(s.detailId)
    s.go('cart')
  }

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 32px 80px' }}>
      <button onClick={() => s.go('shop')} style={{ background: 'none', border: 'none', color: '#9a958c', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>← {t.detailBack}</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'start' }}>
        {/* gallery */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ ...thumb, background: detail.tile, border: '2px solid #EF6A55' }}>
              <ImageSlot id="og-d-t1" radius={14} placeholder="图" />
            </div>
            <div style={{ ...thumb, background: '#EFE6D6' }}>
              <ImageSlot id="og-d-t2" radius={14} placeholder="图" />
            </div>
            <div style={{ ...thumb, background: '#EFE6D6' }}>
              <ImageSlot id="og-d-t3" radius={14} placeholder="图" />
            </div>
            <div style={{ ...thumb, background: '#EFE6D6' }}>
              <ImageSlot id="og-d-t4" radius={14} placeholder="视频" />
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <PlayIcon size={24} color="#2E2A24" />
              </span>
            </div>
          </div>
          <div style={{ flex: 1, aspectRatio: '1 / 1', borderRadius: 28, overflow: 'hidden', background: detail.tile, boxShadow: '0 24px 50px -24px rgba(43,43,43,.3)' }}>
            <ImageSlot id="og-d-main" radius={28} placeholder={t.phMain} />
          </div>
        </div>

        {/* info */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {detail.hasBadge && <span style={cssToStyle(detail.badgeChip)}>{detail.badge}</span>}
            <span style={{ padding: '6px 12px', borderRadius: 999, background: '#E5EBED', fontSize: 11, fontWeight: 700, letterSpacing: '.5px' }}>3D PRINTED</span>
          </div>
          <h1 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 34, margin: 0 }}>{detail.cn}</h1>
          <p style={{ fontSize: 14, color: '#9a958c', margin: '4px 0 0' }}>{detail.en}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ color: '#FFB020', fontSize: 15, letterSpacing: 2 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: '#6b665e' }}>{t.ratingText}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 20 }}>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 36, color: '#EF6A55' }}>{detail.priceFmt}</span>
            <span style={{ fontSize: 14, color: '#c4bfb5', textDecoration: 'line-through' }}>{detail.oldPriceFmt}</span>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: '#FBEBDC', color: '#EF6A55', fontSize: 11, fontWeight: 700 }}>{t.earlybird}</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#6b665e', margin: '18px 0 0' }}>{t.detailDesc}</p>

          <div style={{ marginTop: 26 }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px' }}>
              {t.pickColor} · <span style={{ color: '#9a958c', fontWeight: 400 }}>{detail.colorNames[s.colorIndex]}</span>
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {detail.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => s.setColorIndex(i)}
                  style={{ width: 44, height: 44, borderRadius: 14, background: c, cursor: 'pointer', border: `3px solid ${i === s.colorIndex ? '#2E2A24' : 'transparent'}`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid rgba(43,43,43,.1)', borderRadius: 999, padding: '8px 10px' }}>
              <button onClick={() => s.setQty(Math.max(1, s.qty - 1))} style={stepBtn}>−</button>
              <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 17, minWidth: 20, textAlign: 'center' }}>{s.qty}</span>
              <button onClick={() => s.setQty(s.qty + 1)} style={stepBtn}>+</button>
            </div>
            <button
              className="h-coral"
              onClick={addDetail}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#EF6A55', color: '#fff', border: 'none', borderRadius: 999, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 24px -8px rgba(239,106,85,.6)' }}
            >
              <BagIcon size={18} color="#fff" />
              {t.addCart}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 22 }}>
            <div style={trustBox}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}><TruckIcon size={22} color="#EF6A55" /></div>
              <p style={{ fontSize: 11, color: '#6b665e', margin: '6px 0 0' }}>{t.tr1}</p>
            </div>
            <div style={trustBox}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}><ShieldIcon size={22} color="#4FA982" /></div>
              <p style={{ fontSize: 11, color: '#6b665e', margin: '6px 0 0' }}>{t.tr2}</p>
            </div>
            <div style={trustBox}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}><BoxIcon size={22} color="#4F86BC" /></div>
              <p style={{ fontSize: 11, color: '#6b665e', margin: '6px 0 0' }}>{t.tr3}</p>
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 22, margin: '0 0 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {t.relatedTitle}
          <SmileyIcon size={20} color="#4FA982" />
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {related.map((p) => (
            <div key={p.id} className="h-card" onClick={p.onOpen} style={relCard}>
              <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden', background: p.tile }}>
                <ImageSlot id={p.slotRel} radius={16} placeholder={t.phProduct} />
              </div>
              <div style={{ padding: '12px 6px 4px' }}>
                <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: 14, margin: 0 }}>{p.cn}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 16 }}>{p.priceFmt}</span>
                  <button
                    className="h-addrel"
                    onClick={(e) => p.onAdd(e)}
                    style={{ width: 34, height: 34, borderRadius: 11, background: '#EFE6D6', color: '#2E2A24', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 0 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
