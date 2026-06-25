import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY, ALL_POSTS_QUERY } from '@/sanity/lib/queries'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  title: string
  slug: string
  publishedAt?: string
  excerpt?: string
  category?: string
  tags?: string[]
  coverImage?: unknown
  body?: unknown[]
  metaTitle?: string
  metaDescription?: string
  author?: { name: string }
  featuredCountry?: { name: string; slug: string }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_POST_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug })
  if (!post) return {}

  const title       = post.metaTitle       ?? `${post.title} – MyAfroWaka`
  const description = post.metaDescription ?? post.excerpt ?? `Read ${post.title} on MyAfroWaka.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [`https://picsum.photos/seed/${slug}-cover/1200/630`],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [`https://picsum.photos/seed/${slug}-cover/1200/630`],
    },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  'Destinations':       '#B55D39',
  'Culture & Heritage': '#3F6A3D',
  'Travel Planning':    '#A22E29',
  'Food Tourism':       '#D5A942',
  'Experiences':        '#3B403E',
}

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
      <blockquote className="border-l-4 border-gold-400 pl-5 py-1 my-6 italic text-charcoal/55 dark-flip-muted font-sans text-[15px] leading-relaxed">
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
    image: ({ value }: { value: { alt?: string; caption?: string } }) => (
      <figure className="my-8">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
          <Image
            src={`https://picsum.photos/seed/${value.alt?.replace(/\s+/g, '-') ?? 'blog-img'}/800/450`}
            alt={value.alt ?? ''}
            fill
            className="object-cover"
          />
        </div>
        {value.caption && (
          <figcaption className="text-center font-mono text-[9px] text-charcoal/35 dark-flip-muted uppercase tracking-[0.1em] mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug }),
    client.fetch<Post[]>(ALL_POSTS_QUERY),
  ])
  if (!post) notFound()

  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
  const related = allPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    datePublished: post.publishedAt,
    url: `https://myafrowaka.com/blog/${slug}`,
    image: `https://picsum.photos/seed/${slug}-cover/1200/630`,
    ...(post.author ? { author: { '@type': 'Person', name: post.author.name } } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'MyAfroWaka',
      logo: { '@type': 'ImageObject', url: 'https://myafrowaka.com/images/myafrowaka-logo-transparent.png' },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] flex items-end">
        <Image
          src={`https://picsum.photos/seed/${slug}-cover/1920/720`}
          alt={post.title}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/55 to-ink/97"/>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          {post.category && (
            <span className="inline-block font-mono text-[8px] uppercase tracking-[0.18em] px-3 py-1 rounded-full text-cream mb-4"
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
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/50">
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <span className="font-mono text-[9px] text-cream/35">{formatDate(post.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Article (2/3) ────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {post.excerpt && (
                <p className="font-sans text-[17px] text-charcoal/65 dark-flip-muted leading-relaxed mb-8 border-l-4 pl-5 italic"
                  style={{ borderColor: accent + '88' }}>
                  {post.excerpt}
                </p>
              )}

              {post.body && post.body.length > 0 ? (
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
                      className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/40 dark-flip-muted border border-line dark-flip-border px-3 py-1 rounded-full">
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
                            src={`https://picsum.photos/seed/${r.slug}-cover/400/225`}
                            alt={r.title}
                            fill
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-bold text-[13px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors line-clamp-2"
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
              {post.author && (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-3">Written by</p>
                  <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text"
                    style={{ letterSpacing: '-0.01em' }}>
                    {post.author.name}
                  </p>
                </div>
              )}

              {/* Country link */}
              {post.featuredCountry && (
                <Link href={`/destinations/${post.featuredCountry.slug}`}
                  className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Destination</p>
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
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-400/60 mb-1">Explore</p>
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
                className="flex items-center gap-2 justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted hover:text-charcoal/55 transition-colors py-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                </svg>
                All articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
