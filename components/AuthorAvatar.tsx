import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/lib/client'

const builder = imageUrlBuilder(client)
type SanityImage = Parameters<typeof builder.image>[0]

// Real authors without a real photo yet get initials, not a stock or
// borrowed photo — WDOS X-30 (no fabricated attribution) applies to images
// as much as to bios. This is the honest "pending" state, not a placeholder
// pretending to be a real photo.
export function AuthorAvatar({
  photo,
  name,
  size = 44,
  className = '',
}: {
  photo?: SanityImage | null
  name: string
  size?: number
  className?: string
}) {
  if (photo) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={builder.image(photo).width(size * 2).height(size * 2).fit('crop').url()}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  const initials = name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={`rounded-full bg-crimson/20 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {/* Session 6.3 — bg-crimson/20 is a translucent tint, so its actual
          rendered color depends on what's behind it: a light card in light
          mode, but the page's dark ink surface in dark mode, which darkens
          the composited circle enough that full-strength text-crimson on it
          fails WCAG AA (axe-core caught this on an author with no articles
          yet, the only state that renders this fallback in practice).
          dark:text-crimson-300 is the same dark-mode-safe step already used
          for text-crimson elsewhere in the app. */}
      <span className="font-display font-bold text-crimson dark:text-crimson-300" style={{ fontSize: size * 0.36 }}>
        {initials}
      </span>
    </div>
  )
}
