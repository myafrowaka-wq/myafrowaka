import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { CATEGORY_COLOR, CATEGORY_COLOR_FALLBACK } from '@/lib/regionColors'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY, ALL_POSTS_QUERY } from '@/sanity/lib/queries'
import { AuthorAvatar } from '@/components/AuthorAvatar'
import { blogStockImage } from '@/lib/stockImageCredits'

const builder = imageUrlBuilder(client)
function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source)
}

// ── Blog image helpers ────────────────────────────────────────────────────────

const blogCoverUrl = blogStockImage

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  title: string
  slug: string
  publishedAt?: string
  _updatedAt?: string
  excerpt?: string
  category?: string
  tags?: string[]
  coverImage?: unknown
  body?: unknown[]
  metaTitle?: string
  metaDescription?: string
  author?: { name: string; slug?: string; bio?: string; photo?: unknown }
  featuredCountry?: { name: string; slug: string }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_POST_SLUGS_QUERY).catch(() => [])
  return slugs
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug }).catch(() => null)
  if (!post) return {}

  const title       = post.metaTitle || `${post.title} – MyAfroWaka`
  const description = post.metaDescription || post.excerpt || `Read ${post.title} on MyAfroWaka.`

  const canonicalUrl = `https://myafrowaka.com/blog/${slug}`
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      publishedTime: post.publishedAt,
      images: [blogCoverUrl(slug)],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [blogCoverUrl(slug)],
    },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── PortableText components ───────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="font-sans text-[15px] text-charcoal/78 dark-flip-muted leading-[1.8] mb-5">{children}</p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-display font-bold text-charcoal dark-flip-text mt-10 mb-4"
        style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-display font-bold text-charcoal dark-flip-text mt-8 mb-3"
        style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', letterSpacing: '-0.012em' }}>{children}</h3>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="bg-sand dark-flip-surf rounded-2xl px-6 py-5 my-6 italic text-charcoal/70 dark-flip-muted font-sans text-[15px] leading-relaxed">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-charcoal dark-flip-text">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ value, children }: { value?: { href: string }; children?: React.ReactNode }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer"
        className="text-crimson underline underline-offset-2 hover:text-crimson/70 transition-colors">
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="font-sans text-[14px] text-charcoal/70 dark-flip-muted leading-relaxed space-y-1.5 mb-5 pl-5 list-disc">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="font-sans text-[14px] text-charcoal/70 dark-flip-muted leading-relaxed space-y-1.5 mb-5 pl-5 list-decimal">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  },
  types: {
    image: ({ value }: { value: { asset?: object; alt?: string; caption?: string } }) => {
      const src = value.asset
        ? urlFor(value).width(1200).height(675).fit('crop').auto('format').url()
        : blogStockImage('__missing__')
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={src}
              alt={value.alt ?? ''}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center font-sans text-[14px] text-charcoal/35 dark-flip-muted uppercase tracking-[0.1em] mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

// ── MyAfroWaka social links ───────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/myafrowaka_',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@myafrowaka_',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@myafrowaka',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'X',
    href: 'https://twitter.com/myafrowaka_',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug }).catch(() => null),
    client.fetch<Post[]>(ALL_POSTS_QUERY).catch(() => [] as Post[]),
  ])
  if (!post) notFound()

  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? CATEGORY_COLOR_FALLBACK) : CATEGORY_COLOR_FALLBACK

  // Reading time — extract only plain text from PortableText blocks to avoid
  // inflating the count with JSON keys, _type, _key, etc.
  let wordCount = 0
  if (post.body) {
    const text = (post.body as Array<{ children?: Array<{ text?: string }> }>)
      .flatMap(block => (block.children ?? []).map(span => span.text ?? ''))
      .join(' ')
    wordCount = text.split(/\s+/).filter(Boolean).length
  }
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  // Also Read: posts sharing at least one tag
  const alsoRead = (post.tags && post.tags.length > 0)
    ? allPosts.filter(p => p.slug !== slug && p.tags?.some(t => post.tags!.includes(t))).slice(0, 3)
    : []

  // Related: same category
  const related = allPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    datePublished: post.publishedAt,
    dateModified: post._updatedAt ?? post.publishedAt,
    url: `https://myafrowaka.com/blog/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://myafrowaka.com/blog/${slug}` },
    image: { '@type': 'ImageObject', url: blogCoverUrl(slug), width: 1200, height: 630 },
    ...(post.author ? {
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.slug ? `https://myafrowaka.com/authors/${post.author.slug}` : 'https://myafrowaka.com/about',
      }
    } : {
      author: { '@type': 'Organization', name: 'MyAfroWaka Editorial Team', url: 'https://myafrowaka.com/about' }
    }),
    publisher: {
      '@type': 'Organization',
      name: 'MyAfroWaka',
      url: 'https://myafrowaka.com',
      logo: { '@type': 'ImageObject', url: 'https://myafrowaka.com/icon.png' },
    },
    inLanguage: 'en',
    isPartOf: { '@type': 'Blog', '@id': 'https://myafrowaka.com/blog', name: 'MyAfroWaka Journal' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] flex items-end">
        <Image
          src={blogCoverUrl(slug)}
          alt={post.title}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/55 to-ink/97"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          <div className="lg:max-w-[66%]">
          {post.category && (
            <span className="inline-block font-sans text-[14px] uppercase tracking-[0.18em] px-3 py-1 rounded-full text-cream mb-4"
              style={{ backgroundColor: accent + 'cc' }}>
              {post.category}
            </span>
          )}

          <h1
            className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(26px, 4.5vw, 56px)', lineHeight: '1.0', letterSpacing: '-0.025em' }}
          >
            {post.title}
          </h1>

          <div className="flex items-center gap-4 flex-wrap mt-4">
            {post.author && (
              post.author.slug ? (
                <Link
                  href={`/authors/${post.author.slug}`}
                  className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/50 hover:text-cream/80 transition-colors"
                >
                  {post.author.name}
                </Link>
              ) : (
                <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream/50">
                  {post.author.name}
                </span>
              )
            )}
            {post.publishedAt && (
              <span className="font-sans text-[14px] text-cream/35">{formatDate(post.publishedAt)}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <svg className="w-3 h-3 text-cream/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-sans text-[14px] text-cream/35">{readingTime} min read</span>
          </div>
          </div>{/* end lg:max-w-[66%] */}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Article (2/3) ────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {post.excerpt && (
                <p className="font-sans text-[17px] text-charcoal/65 dark-flip-muted leading-relaxed mb-8 italic border-t border-b py-5"
                  style={{ borderColor: accent + '33' }}>
                  {post.excerpt}
                </p>
              )}

              {/* Sanity PortableText body */}
              {post.body && (post.body as unknown[]).length > 0 ? (
                <div>
                  <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} components={ptComponents} />
                </div>
              ) : (
                <p className="font-sans text-sm text-charcoal/35 dark-flip-muted italic">
                  Article body coming soon.
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-line dark-flip-border flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag}
                      className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/40 dark-flip-muted border border-line dark-flip-border px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-display font-bold text-charcoal dark-flip-text mb-6"
                    style={{ fontSize: 'clamp(16px, 2vw, 22px)', letterSpacing: '-0.015em' }}>
                    More from {post.category}
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map(r => (
                      <Link key={r.slug} href={`/blog/${r.slug}`}
                        className="group block bg-sand dark-flip-surf border border-line dark-flip-border hover:border-gold-300 rounded-xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={blogCoverUrl(r.slug)}
                            alt={r.title}
                            fill
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors line-clamp-2"
                            style={{ letterSpacing: '-0.01em' }}>
                            {r.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Author */}
              {post.author && (() => {
                const bio = post.author.bio ?? 'A contributor to the MyAfroWaka editorial team, writing about travel and culture across the African continent.'
                const authorSlug = post.author.slug
                const avatar = (
                  <AuthorAvatar
                    photo={post.author.photo as Parameters<typeof AuthorAvatar>[0]['photo']}
                    name={post.author.name}
                    size={44}
                    className="border-2 border-gold-300/40"
                  />
                )
                return (
                  <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                    <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-4">Written by</p>
                    {authorSlug ? (
                      <Link href={`/authors/${authorSlug}`} className="flex items-center gap-3 mb-3 group/author">
                        {avatar}
                        <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text group-hover/author:text-crimson transition-colors leading-tight"
                          style={{ letterSpacing: '-0.01em' }}>
                          {post.author.name}
                        </p>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 mb-3">
                        {avatar}
                        <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text leading-tight" style={{ letterSpacing: '-0.01em' }}>
                          {post.author.name}
                        </p>
                      </div>
                    )}
                    <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted leading-relaxed mb-4">
                      {bio}
                    </p>
                    {authorSlug && (
                      <Link
                        href={`/authors/${authorSlug}`}
                        className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors"
                      >
                        View profile &#8594;
                      </Link>
                    )}
                  </div>
                )
              })()}

              {/* Follow MyAfroWaka */}
              <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-4">Follow MyAfroWaka</p>
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-line dark-flip-border text-charcoal/40 dark-flip-muted hover:border-crimson hover:text-crimson transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d={s.path}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Country link */}
              {post.featuredCountry && (
                <Link href={`/destinations/${post.featuredCountry.slug}`}
                  className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                  <div>
                    <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Destination</p>
                    <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                      {post.featuredCountry.name}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
              )}

              {/* Browse CTA */}
              <Link href="/search"
                className="flex items-center justify-between bg-ink rounded-3xl p-6 group transition-all">
                <div>
                  <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-gold-400/60 mb-1">Explore</p>
                  <p className="font-display font-bold text-base text-cream group-hover:text-gold-400 transition-colors">
                    Browse Attractions
                  </p>
                </div>
                <svg className="w-5 h-5 text-cream/25 group-hover:text-gold-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>

              {/* Back to blog */}
              <Link href="/blog"
                className="flex items-center gap-2 justify-center font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted hover:text-charcoal/55 transition-colors py-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                </svg>
                All articles
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Also Read */}
      {alsoRead.length > 0 && (
        <div className="bg-sand dark-flip-surf border-t border-line dark-flip-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-6">Also Read</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {alsoRead.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group block bg-white dark-flip-card rounded-2xl overflow-hidden border border-line dark-flip-border hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={blogCoverUrl(r.slug)}
                      alt={r.title} fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    {r.category && (
                      <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson mb-2">{r.category}</p>
                    )}
                    <h3 className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug line-clamp-2"
                      style={{ letterSpacing: '-0.01em' }}>
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted leading-relaxed mt-2 line-clamp-2">{r.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
