import type { CSSProperties } from 'react'

export interface IconProps {
  size?: number
  color?: string
  style?: CSSProperties
}

const strokeG = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function base(size: number, color?: string, style?: CSSProperties): CSSProperties {
  return { width: size, height: size, color, flex: 'none', display: 'block', ...style }
}

/* ---- brand logo (bubble puck) ---- */
export function Logo({ size = 34, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size, display: 'block', ...style }}>
      <rect width="40" height="40" rx="12" fill="#EF6A55" />
      <g fill="#fff">
        <circle cx="20" cy="20" r="2.7" />
        <circle cx="20" cy="12.3" r="2.7" />
        <circle cx="27.7" cy="20" r="2.7" />
        <circle cx="20" cy="27.7" r="2.7" />
        <circle cx="12.3" cy="20" r="2.7" />
      </g>
    </svg>
  )
}

/* ---- stroke icons ---- */
export function SearchIcon({ size = 18, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="11" cy="11" r="6.3" />
        <path d="M16.4 16.4 21 21" />
      </g>
    </svg>
  )
}

export function HeartIcon({ size = 18, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M12 20.3C6.2 16.4 4.2 12.8 4.2 9.7 4.2 7.1 6.1 5.3 8.4 5.3c1.6 0 2.9.9 3.6 2.1.7-1.2 2-2.1 3.6-2.1 2.3 0 4.2 1.8 4.2 4.4 0 3.1-2 6.7-7.8 10.6Z" />
      </g>
    </svg>
  )
}

export function BagIcon({ size = 18, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M6.6 8h10.8l.9 12.2H5.7Z" />
        <path d="M9 8.6V7a3 3 0 0 1 6 0v1.6" />
      </g>
    </svg>
  )
}

export function SmileyIcon({ size = 20, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="12" cy="12" r="8.3" />
        <path d="M8.4 14.2a4.6 4.6 0 0 0 7.2 0" />
        <path d="M9 10.2h.01" />
        <path d="M15 10.2h.01" />
      </g>
    </svg>
  )
}

export function ClusterIcon({ size = 14, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="12" cy="7.2" r="2.7" />
        <circle cx="16.4" cy="10.4" r="2.7" />
        <circle cx="14.7" cy="15.6" r="2.7" />
        <circle cx="9.3" cy="15.6" r="2.7" />
        <circle cx="7.6" cy="10.4" r="2.7" />
      </g>
    </svg>
  )
}

export function DotsIcon({ size = 36, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="12" cy="12" r="8.3" />
        <path d="M12 12h.01" />
        <path d="M12 8h.01" />
        <path d="M16 12h.01" />
        <path d="M12 16h.01" />
        <path d="M8 12h.01" />
      </g>
    </svg>
  )
}

export function KeychainIcon({ size = 36, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="9" cy="9" r="4.4" />
        <path d="M12.1 12.1 19 19" />
        <path d="M15.5 15.5 17.5 13.5" />
        <path d="M18 18 20 16" />
      </g>
    </svg>
  )
}

export function BlocksIcon({ size = 36, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <rect x="5" y="9.5" width="14" height="9" rx="1.8" />
        <path d="M8.5 9.5V8a1.6 1.6 0 0 1 3.2 0v1.5" />
        <path d="M12.8 9.5V8a1.6 1.6 0 0 1 3.2 0v1.5" />
      </g>
    </svg>
  )
}

export function LayersIcon({ size = 30, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M12 3.8l8.2 4.1-8.2 4.1-8.2-4.1Z" />
        <path d="M3.8 12l8.2 4.1 8.2-4.1" />
        <path d="M3.8 16.1l8.2 4.1 8.2-4.1" />
      </g>
    </svg>
  )
}

export function PaletteIcon({ size = 30, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <circle cx="9" cy="9.6" r="3.3" />
        <circle cx="15" cy="9.6" r="3.3" />
        <circle cx="12" cy="15" r="3.3" />
      </g>
    </svg>
  )
}

export function LeafIcon({ size = 30, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M5 19.2C5 11.4 11 6 19.2 5.6 19 13.4 13 19.2 5 19.2Z" />
        <path d="M5 19.2C8.4 16 11.6 13.4 15 12" />
      </g>
    </svg>
  )
}

export function TruckIcon({ size = 22, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <rect x="3" y="7" width="11" height="8.4" rx="1.5" />
        <path d="M14 10.4h3.6l3 3v2H14Z" />
        <circle cx="7.4" cy="17" r="1.7" />
        <circle cx="17.4" cy="17" r="1.7" />
      </g>
    </svg>
  )
}

export function ShieldIcon({ size = 22, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M12 3.2l7 2.5v5.2c0 4.4-3 7.4-7 9.3-4-1.9-7-4.9-7-9.3V5.7Z" />
        <path d="M9 12l2 2 4-4.4" />
      </g>
    </svg>
  )
}

export function BoxIcon({ size = 22, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M12 3.4l8 4v9.2l-8 4-8-4V7.4Z" />
        <path d="M4 7.4l8 4 8-4" />
        <path d="M12 11.4V20.6" />
      </g>
    </svg>
  )
}

export function CouponIcon({ size = 16, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <path d="M4 8.6A1.6 1.6 0 0 1 5.6 7h12.8A1.6 1.6 0 0 1 20 8.6a2 2 0 0 0 0 4v2.8A1.6 1.6 0 0 1 18.4 17H5.6A1.6 1.6 0 0 1 4 15.4v-2.8a2 2 0 0 0 0-4Z" />
      </g>
    </svg>
  )
}

export function MailIcon({ size = 18, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M4.2 8.4 12 13.4l7.8-5" />
      </g>
    </svg>
  )
}

export function CameraIcon({ size = 18, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g {...strokeG}>
        <rect x="3" y="7.6" width="18" height="10.8" rx="2.5" />
        <circle cx="12" cy="13" r="3.1" />
        <path d="M8.6 7.6 9.8 5.6h4.4l1.2 2" />
      </g>
    </svg>
  )
}

/* ---- fill icons ---- */
export function SparkleIcon({ size = 13, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g fill="currentColor" stroke="none">
        <path d="M12 2.5c.7 4.7 1.8 5.8 6.5 6.5-4.7.7-5.8 1.8-6.5 6.5-.7-4.7-1.8-5.8-6.5-6.5C10.2 8.3 11.3 7.2 12 2.5Z" />
        <path d="M18.6 14.4c.3 2 .8 2.5 2.9 2.9-2.1.3-2.6.8-2.9 2.9-.3-2.1-.8-2.6-2.9-2.9 2.1-.4 2.6-.9 2.9-2.9Z" />
      </g>
    </svg>
  )
}

export function FlameIcon({ size = 21, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g fill="currentColor" stroke="none">
        <path d="M13 2.4c.3 2.6 1.9 4 3.3 5.4C17.8 9.3 19 11 19 13.4A7 7 0 0 1 5 13.4c0-1.8.7-3.4 1.8-4.6.1 1.2.9 2 1.9 2 1.3 0 1.7-1.4 1-2.7C9.5 6.5 10 4.3 13 2.4Z" />
      </g>
    </svg>
  )
}

export function PlayIcon({ size = 24, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, color, style)}>
      <g fill="currentColor" stroke="none">
        <path d="M9 7.4c0-.6.7-1 1.2-.6l7 4.6c.5.3.5 1 0 1.3l-7 4.6c-.5.4-1.2 0-1.2-.6Z" />
      </g>
    </svg>
  )
}
