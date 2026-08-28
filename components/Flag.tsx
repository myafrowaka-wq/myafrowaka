// Real flag graphics (flag-icons, MIT, self-hosted SVG) — replaces flagEmoji.
// Emoji flags render inconsistently across OS/devices, can't be styled or
// sized reliably, and several platforms don't render them as flags at all
// (WDOS I-01/X-02). countryCode is the ISO 3166-1 alpha-2 code, lowercase.
export function Flag({ code, className = '' }: { code?: string; className?: string }) {
  if (!code) return null
  return (
    <span
      className={`fi fi-${code.toLowerCase()} rounded-[2px] shrink-0 ${className}`}
      role="img"
      aria-label="flag"
    />
  )
}
