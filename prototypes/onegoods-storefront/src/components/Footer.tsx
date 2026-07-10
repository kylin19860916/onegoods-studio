import type { CSSProperties } from 'react'
import { useStore } from '../store'
import { CameraIcon, Logo, MailIcon } from './Icons'

const socialBox: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 11,
  background: '#fff',
  border: '1px solid rgba(43,43,43,.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function Footer() {
  const { t } = useStore()
  return (
    <footer style={{ borderTop: '1px solid rgba(43,43,43,.06)', marginTop: 20 }}>
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '40px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, display: 'flex' }}>
            <Logo size={30} />
          </span>
          <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 15 }}>OneGoods Studio</span>
        </div>
        <div style={{ display: 'flex', gap: 26, fontSize: 13, color: '#6b665e' }}>
          <a href="#" style={{ color: '#6b665e' }}>{t.navShop}</a>
          <a href="#" style={{ color: '#6b665e' }}>{t.navAbout}</a>
          <a href="#" style={{ color: '#6b665e' }}>{t.footShip}</a>
          <a href="#" style={{ color: '#6b665e' }}>{t.footContact}</a>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 16 }}>
          <span style={socialBox}>
            <MailIcon size={18} color="#6b665e" />
          </span>
          <span style={socialBox}>
            <CameraIcon size={18} color="#6b665e" />
          </span>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#c4bfb5', padding: '0 0 28px', margin: 0 }}>{t.copyright}</p>
    </footer>
  )
}
