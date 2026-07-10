import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface ImageSlotProps {
  id: string
  radius?: number
  placeholder?: string
  /** Pre-seeded image (e.g. the hero photo baked into the bundle). */
  defaultSrc?: string
}

const KEY = (id: string) => `og-slot:${id}`

function readStored(id: string): string | null {
  try {
    return localStorage.getItem(KEY(id))
  } catch {
    return null
  }
}

/**
 * Drag-and-drop / click-to-upload image slot.
 * An uploaded photo is stored as a data URL in localStorage keyed by the slot id,
 * mirroring the prototype's persistent image slots. Falls back to `defaultSrc`.
 */
export default function ImageSlot({ id, radius = 16, placeholder, defaultSrc }: ImageSlotProps) {
  const [src, setSrc] = useState<string | null>(() => readStored(id) ?? defaultSrc ?? null)
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setSrc(url)
      try {
        localStorage.setItem(KEY(id), url)
      } catch {
        /* storage may be full or blocked — keep the in-memory preview */
      }
    }
    reader.readAsDataURL(file)
  }

  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: radius,
    overflow: 'hidden',
    cursor: 'pointer',
  }

  return (
    <div
      style={wrap}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        load(e.dataTransfer.files[0])
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 12,
            border: `2px dashed ${over ? '#EF6A55' : 'rgba(43,43,43,.16)'}`,
            borderRadius: radius,
            background: over ? 'rgba(239,106,85,.06)' : 'transparent',
            color: '#9a958c',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.4,
            transition: 'border-color .15s ease, background .15s ease',
          }}
        >
          {placeholder}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => load(e.target.files?.[0])}
      />
    </div>
  )
}
