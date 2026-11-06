/**
 * Brand logo lockup (public/brand/logo.png).
 * The source artwork already contains the Arabic "كلاسي" over the Latin wordmark.
 * @see docs/BRAND_GUIDE.md
 */
const LOGO_SRC = '/brand/logo.png'

/** Ratio of the source artwork, used to reserve space and avoid layout shift. */
const LOGO_RATIO = 247 / 108

export function Wordmark({ compact = false }: { compact?: boolean }) {
  const height = compact ? 40 : 64

  return (
    <img
      src={LOGO_SRC}
      alt="Classy Men Rim"
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      decoding="async"
      style={{ height, width: 'auto' }}
      className="block"
    />
  )
}
