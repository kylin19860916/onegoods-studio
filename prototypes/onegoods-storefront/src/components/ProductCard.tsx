import type { CSSProperties } from 'react'
import type { DecoratedProduct } from '../store'
import { useStore } from '../store'
import { cssToStyle } from '../css'
import ImageSlot from './ImageSlot'
import { HeartIcon } from './Icons'

const card: CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: 14,
  cursor: 'pointer',
  boxShadow: '0 10px 30px -18px rgba(43,43,43,.28)',
  border: '1px solid rgba(43,43,43,.04)',
}

export default function ProductCard({ p, slotId }: { p: DecoratedProduct; slotId: string }) {
  const { t } = useStore()
  return (
    <div className="h-card" onClick={p.onOpen} style={card}>
      <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden', background: p.tile }}>
        <ImageSlot id={slotId} radius={16} placeholder={t.phProduct} />
        {p.hasBadge && <span style={cssToStyle(p.badgeStyle)}>{p.badge}</span>}
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HeartIcon size={16} color="#9a958c" />
        </span>
      </div>
      <div style={{ padding: '14px 6px 6px' }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
          {p.colors.map((c, i) => (
            <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }} />
          ))}
        </div>
        <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 600, fontSize: 15, margin: 0 }}>{p.cn}</h3>
        <p style={{ fontSize: 12, color: '#9a958c', margin: '2px 0 0' }}>{p.en}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 18 }}>{p.priceFmt}</span>
          <button
            className="h-coral"
            onClick={(e) => p.onAdd(e)}
            style={{ width: 38, height: 38, borderRadius: 12, background: '#EF6A55', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 0 }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
