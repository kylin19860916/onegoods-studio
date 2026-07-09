import type { CSSProperties } from 'react'
import { useStore } from '../store'
import ImageSlot from '../components/ImageSlot'
import ProductCard from '../components/ProductCard'
import {
  ClusterIcon,
  DotsIcon,
  FlameIcon,
  HeartIcon,
  KeychainIcon,
  BlocksIcon,
  LayersIcon,
  LeafIcon,
  PaletteIcon,
  SmileyIcon,
  SparkleIcon,
} from '../components/Icons'

const sectionTitle: CSSProperties = { fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 24, margin: 0 }

const arrowCircle: CSSProperties = {
  position: 'absolute',
  bottom: 18,
  right: 18,
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
}

const miniBadge: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 10px rgba(43,43,43,.06)',
}

function CategoryTile({
  bg,
  icon,
  title,
  sub,
  onClick,
}: {
  bg: string
  icon: React.ReactNode
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      className="h-bright"
      onClick={onClick}
      style={{ textAlign: 'left', border: 'none', cursor: 'pointer', background: bg, borderRadius: 24, padding: 22, height: 190, position: 'relative', overflow: 'hidden' }}
    >
      <span style={{ display: 'flex', height: 40 }}>{icon}</span>
      <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 19, margin: '14px 0 2px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: '#6b665e', margin: 0 }}>{sub}</p>
      <span style={arrowCircle}>→</span>
    </button>
  )
}

function ValueItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div>
      <div style={{ display: 'flex', height: 34, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 18, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#b8b3a9', margin: 0 }}>{sub}</p>
    </div>
  )
}

export default function Home() {
  const s = useStore()
  const { t } = s
  const featured = s.products.slice(0, 4)

  return (
    <main style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 32px 80px' }}>
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(140deg,#F7ECD9 0%,#F2E1CC 60%,#EEDBC4 100%)',
          borderRadius: 36,
          padding: '56px 56px 52px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -30px rgba(43,43,43,.18)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#fff',
                borderRadius: 999,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: '#EF6A55',
                boxShadow: '0 4px 12px rgba(43,43,43,.06)',
              }}
            >
              <SparkleIcon size={13} color="#EF6A55" />
              {t.heroPill}
            </span>
            <h1 style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 56, lineHeight: 1.02, margin: '20px 0 0', letterSpacing: '-1px' }}>
              Play more.
              <br />
              Carry joy.
              <br />
              <span style={{ color: '#EF6A55' }}>Make it yours.</span>
            </h1>
            <p style={{ fontFamily: s.sloganFont, fontSize: 26, color: '#EF6A55', margin: '16px 0 0', transform: 'rotate(-2deg)', display: 'inline-block' }}>{t.slogan}</p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#6b665e', margin: '14px 0 0', maxWidth: 380 }}>{t.heroDesc}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                className="h-coral"
                onClick={() => s.go('shop')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#EF6A55', color: '#fff', border: 'none', borderRadius: 999, padding: '16px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 24px -8px rgba(239,106,85,.6)' }}
              >
                {t.heroCtaShop} <span style={{ fontSize: 17 }}>→</span>
              </button>
              <button
                className="h-white"
                onClick={() => s.go('about')}
                style={{ background: '#fff', color: '#2E2A24', border: '1px solid rgba(43,43,43,.1)', borderRadius: 999, padding: '16px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                {t.heroCtaAbout}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 26, fontSize: 20 }}>
              <span style={miniBadge}><HeartIcon size={20} color="#EF6A55" /></span>
              <span style={miniBadge}><SparkleIcon size={20} color="#E3A233" /></span>
              <span style={miniBadge}><SmileyIcon size={20} color="#4FA982" /></span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 50px -20px rgba(43,43,43,.3)', animation: 'floaty 6s ease-in-out infinite' }}>
              <ImageSlot id="og-hero" radius={28} placeholder={t.phHero} defaultSrc="/hero.webp" />
            </div>
            <span
              style={{
                position: 'absolute',
                top: -14,
                left: -14,
                background: '#FFD86B',
                borderRadius: 16,
                padding: '10px 16px',
                fontFamily: "'Quicksand',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                transform: 'rotate(-8deg)',
                boxShadow: '0 8px 18px rgba(43,43,43,.12)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              GOOD CHOICE <ClusterIcon size={14} color="#2E2A24" />
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: 18,
                right: -16,
                background: '#fff',
                borderRadius: 16,
                padding: '12px 16px',
                boxShadow: '0 10px 24px rgba(43,43,43,.14)',
                fontSize: 13,
              }}
            >
              <b style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16 }}>{s.fmt(39)}</b>
              <span style={{ color: '#9a958c', fontSize: 11 }}> {t.heroFrom}</span>
              <br />
              <span style={{ color: '#6b665e', fontSize: 11 }}>{t.heroPriceName}</span>
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section style={{ marginTop: 44 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={sectionTitle}>{t.catTitle}</h2>
          <span style={{ fontSize: 13, color: '#9a958c' }}>{t.catSub}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <CategoryTile bg="#E7EFE4" icon={<DotsIcon size={36} color="#4FA982" />} title={t.cat1t} sub={t.cat1s} onClick={() => s.go('shop')} />
          <CategoryTile bg="#F4EAD1" icon={<KeychainIcon size={36} color="#C0912F" />} title={t.cat2t} sub={t.cat2s} onClick={() => s.go('shop')} />
          <CategoryTile bg="#E5EBED" icon={<BlocksIcon size={36} color="#4F86BC" />} title={t.cat3t} sub={t.cat3s} onClick={() => s.go('shop')} />
          <CategoryTile bg="#ECE5EF" icon={<ClusterIcon size={36} color="#7E6DBA" />} title={t.cat4t} sub={t.cat4s} onClick={() => s.go('shop')} />
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ ...sectionTitle, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t.featTitle}
              <FlameIcon size={21} color="#EF6A55" />
            </h2>
            <p style={{ fontSize: 13, color: '#9a958c', margin: '6px 0 0' }}>{t.featSub}</p>
          </div>
          <button onClick={() => s.go('shop')} style={{ background: 'none', border: 'none', color: '#EF6A55', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>{t.featAll} →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} slotId={p.slot} />
          ))}
        </div>
      </section>

      {/* VALUE STRIP */}
      <section style={{ marginTop: 56, background: '#2E2A24', borderRadius: 32, padding: '44px 48px', color: '#FAF2E4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
          <ValueItem icon={<LayersIcon size={30} color="#FFD86B" />} title={t.val1t} sub={t.val1s} />
          <ValueItem icon={<PaletteIcon size={30} color="#B6DDF7" />} title={t.val2t} sub={t.val2s} />
          <ValueItem icon={<LeafIcon size={30} color="#A7E6C6" />} title={t.val3t} sub={t.val3s} />
        </div>
      </section>
    </main>
  )
}
