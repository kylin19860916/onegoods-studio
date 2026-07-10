import type { CSSProperties } from 'react'
import { useStore } from '../store'
import { BagIcon, HeartIcon, Logo, SearchIcon } from './Icons'

const navStyle = (active: boolean): CSSProperties => ({
  padding: '9px 16px',
  borderRadius: 12,
  border: 'none',
  background: active ? '#2E2A24' : 'transparent',
  color: active ? '#fff' : '#2E2A24',
  fontFamily: "'Inter','Noto Sans SC',sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

const langStyle = (active: boolean): CSSProperties => ({
  padding: '6px 11px',
  border: 'none',
  background: active ? '#2E2A24' : 'transparent',
  color: active ? '#fff' : '#8A8175',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Inter','Noto Sans SC',sans-serif",
  whiteSpace: 'nowrap',
})

const pillGroup: CSSProperties = {
  display: 'flex',
  background: '#fff',
  border: '1px solid rgba(43,43,43,.08)',
  borderRadius: 999,
  padding: 3,
}

const iconBtn: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: '#fff',
  border: '1px solid rgba(43,43,43,.08)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function Nav() {
  const s = useStore()
  const { t, screen } = s

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(250,242,228,.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(43,43,43,.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <button
          onClick={() => s.go('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ width: 34, height: 34, display: 'flex', boxShadow: '0 5px 12px rgba(239,106,85,.35)', borderRadius: 12 }}>
            <Logo size={34} />
          </span>
          <span style={{ textAlign: 'left', lineHeight: 1.05 }}>
            <span style={{ display: 'block', fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 17, color: '#2E2A24' }}>OneGoods</span>
            <span style={{ display: 'block', fontFamily: "'ZCOOL KuaiLe',cursive", fontSize: 12, color: '#EF6A55', letterSpacing: 1 }}>{t.workshop}</span>
          </span>
        </button>

        <nav style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          <button className="h-nav" onClick={() => s.go('home')} style={navStyle(screen === 'home')}>{t.navHome}</button>
          <button className="h-nav" onClick={() => s.go('shop')} style={navStyle(screen === 'shop' || screen === 'detail')}>{t.navShop}</button>
          <button className="h-nav" onClick={() => s.go('about')} style={navStyle(screen === 'about')}>{t.navAbout}</button>
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={pillGroup}>
            <button onClick={() => s.setLang('zh')} style={langStyle(s.lang === 'zh')}>简</button>
            <button onClick={() => s.setLang('tw')} style={langStyle(s.lang === 'tw')}>繁</button>
            <button onClick={() => s.setLang('en')} style={langStyle(s.lang === 'en')}>EN</button>
          </div>
          <div style={pillGroup}>
            <button onClick={() => s.setCur('CNY')} style={langStyle(s.currency === 'CNY')}>¥</button>
            <button onClick={() => s.setCur('TWD')} style={langStyle(s.currency === 'TWD')}>NT$</button>
            <button onClick={() => s.setCur('AUD')} style={langStyle(s.currency === 'AUD')}>AU$</button>
          </div>
          <button className="h-white" style={iconBtn}>
            <SearchIcon size={18} color="#9a958c" />
          </button>
          <button className="h-white" style={iconBtn}>
            <HeartIcon size={18} color="#2E2A24" />
          </button>
          <button
            className="h-dark"
            onClick={() => s.go('cart')}
            style={{ position: 'relative', width: 42, height: 42, borderRadius: 14, background: '#2E2A24', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <BagIcon size={18} color="#fff" />
            {s.cart.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  minWidth: 20,
                  height: 20,
                  padding: '0 5px',
                  borderRadius: 999,
                  background: '#EF6A55',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FAF2E4',
                }}
              >
                {s.cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
