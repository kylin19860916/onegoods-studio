import type { CSSProperties } from 'react'
import { useStore } from '../store'
import ImageSlot from '../components/ImageSlot'

const stepCard = (bg: string): CSSProperties => ({ background: bg, borderRadius: 24, padding: 28 })
const stepNum: CSSProperties = { fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 34, color: '#EF6A55' }
const stepTitle: CSSProperties = { fontFamily: "'Quicksand',sans-serif", fontSize: 18, margin: '12px 0 6px' }
const stepSub: CSSProperties = { fontSize: 13, lineHeight: 1.6, color: '#6b665e', margin: 0 }

export default function About() {
  const s = useStore()
  const { t } = s

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', fontFamily: "'ZCOOL KuaiLe',cursive", fontSize: 34, color: '#EF6A55', transform: 'rotate(-2deg)' }}>{t.workshop}</span>
        <h1 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 44, lineHeight: 1.1, margin: '12px 0 0' }}>
          {t.aboutH1a}
          <br />
          {t.aboutH1b}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#6b665e', margin: '22px 0 0' }}>{t.aboutIntro}</p>
      </div>

      <div style={{ aspectRatio: '16 / 7', borderRadius: 32, overflow: 'hidden', background: '#EDE6DE', margin: '44px 0', boxShadow: '0 24px 50px -28px rgba(43,43,43,.3)' }}>
        <ImageSlot id="og-about-hero" radius={32} placeholder={t.phAbout} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 8 }}>
        <div style={stepCard('#E7EFE4')}>
          <span style={stepNum}>01</span>
          <h3 style={stepTitle}>{t.s1t}</h3>
          <p style={stepSub}>{t.s1s}</p>
        </div>
        <div style={stepCard('#F4EAD1')}>
          <span style={stepNum}>02</span>
          <h3 style={stepTitle}>{t.s2t}</h3>
          <p style={stepSub}>{t.s2s}</p>
        </div>
        <div style={stepCard('#ECE5EF')}>
          <span style={stepNum}>03</span>
          <h3 style={stepTitle}>{t.s3t}</h3>
          <p style={stepSub}>{t.s3s}</p>
        </div>
      </div>

      <div style={{ background: '#2E2A24', borderRadius: 32, padding: 48, marginTop: 44, textAlign: 'center', color: '#FAF2E4' }}>
        <p style={{ fontFamily: s.sloganFont, fontSize: 28, color: '#FFD86B', margin: 0 }}>{t.slogan}</p>
        <p style={{ fontSize: 14, color: '#b8b3a9', margin: '14px auto 26px', maxWidth: 440 }}>{t.aboutQuote}</p>
        <button onClick={() => s.go('shop')} style={{ background: '#EF6A55', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{t.aboutCta} →</button>
      </div>
    </main>
  )
}
