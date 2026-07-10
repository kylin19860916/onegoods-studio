import type { CSSProperties } from 'react'

/**
 * Convert an inline CSS string ("a:b;c:d") into a React style object.
 * Used for the dynamically-generated badge styles carried over from the prototype.
 */
export function cssToStyle(css: string): CSSProperties {
  const out: Record<string, string> = {}
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!prop) continue
    const key = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[key] = val
  }
  return out as CSSProperties
}
