import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY, ALL_POSTS_QUERY } from '@/sanity/lib/queries'
import { FALLBACK_POSTS, type FallbackPost } from '@/lib/fallbackPosts'
import { ScrollProgress } from '@/components/ScrollProgress'

const builder = imageUrlBuilder(client)
function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source)
}

// ── Blog image helpers ────────────────────────────────────────────────────────

const BLOG_COVERS: Record<string, string> = {
  'lagos-rush-hour-city-life':              '67ruAEYmp4c',
  'kumasi-central-market-west-africa':      'w-jFW9XkDBg',
  'slow-travel-rwanda':                     '1ihYfuwRZds',
  'namib-desert-first-light':              '2vSQw0Qxi5c',
  'west-africa-food-culture':               'lNIy1gZUWwc',
  'zanzibar-stone-town-doors':              'XSgMLCn3cMs',
  'marrakech-djemaa-el-fna-guide':          'CFKksjYRSQ8',
  'victoria-falls-zimbabwe-guide':          'nsm-gUKDMeQ',
  'maasai-mara-wildebeest-migration-kenya': '7T6BXB4ahZw',
  'cape-town-winter-travel-guide':          'byUDvQhsh4U',
  'addis-ababa-walking-guide':              'qEGQxK8NFN4',
}

function blogCoverUrl(slug: string, width = 1200) {
  const id = BLOG_COVERS[slug]
  return id
    ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`
    : `https://images.unsplash.com/photo-1ihYfuwRZds?auto=format&fit=crop&w=${width}&q=80`
}

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
  author?: { name: string }
  featuredCountry?: { name: string; slug: string }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const sanityslugs = await client.fetch<{ slug: string }[]>(ALL_POST_SLUGS_QUERY).catch(() => [])
  const fallbackSlugs = FALLBACK_POSTS.map(p => ({ slug: p.slug }))
  const all = [...sanityslugs, ...fallbackSlugs]
  const seen = new Set<string>()
  return all.filter(s => { if (seen.has(s.slug)) return false; seen.add(s.slug); return true })
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const sanityPost = await client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug }).catch(() => null)
  const post = sanityPost ?? FALLBACK_POSTS.find(p => p.slug === slug)
  if (!post) return {}

  const title       = ('metaTitle' in post && post.metaTitle) ? post.metaTitle : `${post.title} – MyAfroWaka`
  const description = ('metaDescription' in post && post.metaDescription) ? post.metaDescription : (post.excerpt ?? `Read ${post.title} on MyAfroWaka.`)

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
      images: [blogCoverUrl(slug, 1200)],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [blogCoverUrl(slug, 1200)],
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
    image: ({ value }: { value: { asset?: object; alt?: string; caption?: string } }) => {
      const src = value.asset
        ? urlFor(value).width(1200).height(675).fit('crop').auto('format').url()
        : `https://images.unsplash.com/photo-7T6BXB4ahZw?auto=format&fit=crop&w=800&q=80`
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
            <figcaption className="text-center font-inter text-[9px] text-charcoal/35 dark-flip-muted uppercase tracking-[0.1em] mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

// ── Author profiles ───────────────────────────────────────────────────────────

const AUTHOR_PROFILES: Record<string, { bio: string; avatarId: string }> = {
  'Amara Osei': {
    avatarId: 'J3mFMkED-vU',
    bio: 'Amara writes about West African culture, coastal destinations, and the stories that make travel worth the journey.',
  },
  'Chioma Adeyemi': {
    avatarId: 'HC_yNe8VtYg',
    bio: 'Chioma covers East African wildlife and conservation, and has reported from parks across Kenya, Tanzania, and Uganda.',
  },
  'Kwame Boateng': {
    avatarId: 'M7ZepOvUcjU',
    bio: 'Kwame specialises in adventure travel and trekking routes across the continent.',
  },
  'Fatou Diallo': {
    avatarId: '1OR7uXqJHpQ',
    bio: 'Fatou explores the intersections of food, tradition, and place across Francophone Africa.',
  },
  'Nadia Mensah': {
    avatarId: 'HC_yNe8VtYg',
    bio: 'Nadia focuses on independent travel in North Africa and has visited every country on the continent.',
  },
  'MyAfroWaka Editorial Team': {
    avatarId: 'M7ZepOvUcjU',
    bio: 'The MyAfroWaka editorial team researches, fact-checks, and publishes guides to the most remarkable places across Africa.',
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [sanityPost, allSanityPosts] = await Promise.all([
    client.fetch<Post | null>(POST_BY_SLUG_QUERY, { slug }).catch(() => null),
    client.fetch<Post[]>(ALL_POSTS_QUERY).catch(() => [] as Post[]),
  ])

  const fallback     = FALLBACK_POSTS.find(p => p.slug === slug)
  const isFallback   = !sanityPost && !!fallback
  if (!sanityPost && !fallback) notFound()

  const post = sanityPost ?? {
    title: fallback!.title, slug: fallback!.slug, publishedAt: fallback!.publishedAt,
    excerpt: fallback!.excerpt, category: fallback!.category, tags: fallback!.tags,
    coverImage: undefined, body: undefined, metaTitle: fallback!.metaTitle,
    metaDescription: fallback!.metaDescription, author: fallback!.author,
    featuredCountry: undefined,
  }

  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'

  // Reading time — extract only plain text from PortableText blocks to avoid inflating
  // count with JSON keys, _type, _key, etc.
  let wordCount = 0
  if (isFallback && fallback?.content) {
    wordCount = fallback.content.join(' ').split(/\s+/).filter(Boolean).length
  } else if (post.body) {
    const text = (post.body as Array<{ children?: Array<{ text?: string }> }>)
      .flatMap(block => (block.children ?? []).map(span => span.text ?? ''))
      .join(' ')
    wordCount = text.split(/\s+/).filter(Boolean).length
  }
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  // Also Read: posts sharing at least one tag
  const allWithTags: { slug: string; title: string; tags?: string[]; excerpt?: string; category?: string }[] = [
    ...allSanityPosts.map(p => ({ slug: p.slug, title: p.title, tags: p.tags, excerpt: p.excerpt, category: p.category })),
    ...FALLBACK_POSTS
      .filter(fp => !allSanityPosts.find(sp => sp.slug === fp.slug))
      .map(fp => ({ slug: fp.slug, title: fp.title, tags: fp.tags, excerpt: fp.excerpt, category: fp.category })),
  ]
  const alsoRead = (post.tags && post.tags.length > 0)
    ? allWithTags.filter(p => p.slug !== slug && p.tags?.some(t => post.tags!.includes(t))).slice(0, 3)
    : []

  // Related: from Sanity first, then fallbacks
  const allForRelated: { slug: string; title: string; category?: string }[] = [
    ...allSanityPosts,
    ...FALLBACK_POSTS.filter(fp => !allSanityPosts.find(sp => sp.slug === fp.slug)),
  ]
  const related = allForRelated.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    datePublished: post.publishedAt,
    dateModified: post._updatedAt ?? post.publishedAt,
    url: `https://myafrowaka.com/blog/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://myafrowaka.com/blog/${slug}` },
    image: { '@type': 'ImageObject', url: blogCoverUrl(slug, 1200), width: 1200, height: 630 },
    ...(post.author ? {
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: 'https://myafrowaka.com/about',
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
      <ScrollProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] flex items-end">
        <Image
          src={blogCoverUrl(slug, 1920)}
          alt={post.title}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/55 to-ink/97"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          <div className="lg:max-w-[66%]">
          {post.category && (
            <span className="inline-block font-inter text-[8px] uppercase tracking-[0.18em] px-3 py-1 rounded-full text-cream mb-4"
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
              <span className="font-inter text-[9px] uppercase tracking-[0.12em] text-cream/50">
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <span className="font-inter text-[9px] text-cream/35">{formatDate(post.publishedAt)}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <svg className="w-3 h-3 text-cream/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-inter text-[9px] text-cream/35">{readingTime} min read</span>
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
                <p className="font-sans text-[17px] text-charcoal/65 dark-flip-muted leading-relaxed mb-8 border-l-4 pl-5 italic"
                  style={{ borderColor: accent + '88' }}>
                  {post.excerpt}
                </p>
              )}

              {/* Sanity PortableText body */}
              {!isFallback && post.body && (post.body as unknown[]).length > 0 && (
                <div>
                  <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} components={ptComponents} />
                </div>
              )}

              {/* Fallback plain-text paragraphs */}
              {isFallback && fallback?.content.map((para, i) => (
                <p key={i} className="font-sans text-[15px] text-charcoal/78 dark-flip-muted leading-[1.8] mb-5">
                  {para}
                </p>
              ))}

              {/* No body placeholder (Sanity post without body) */}
              {!isFallback && (!post.body || (post.body as unknown[]).length === 0) && (
                <p className="font-sans text-sm text-charcoal/35 dark-flip-muted italic">
                  Article body coming soon.
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-line dark-flip-border flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag}
                      className="font-inter text-[9px] uppercase tracking-[0.12em] text-charcoal/40 dark-flip-muted border border-line dark-flip-border px-3 py-1 rounded-full">
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
                            src={blogCoverUrl(r.slug, 400)}
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
              {post.author && (() => {
                const profile = AUTHOR_PROFILES[post.author.name]
                const bio = profile?.bio ?? 'A contributor to the MyAfroWaka editorial team, writing about travel and culture across the African continent.'
                return (
                  <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                    <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-4">Written by</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-gold-300/40">
                        <Image
                          src={`https://images.unsplash.com/photo-${profile?.avatarId ?? 'M7ZepOvUcjU'}?auto=format&fit=crop&w=88&q=80&crop=faces`}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text leading-tight"
                        style={{ letterSpacing: '-0.01em' }}>
                        {post.author.name}
                      </p>
                    </div>
                    <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed">
                      {bio}
                    </p>
                  </div>
                )
              })()}

              {/* Country link */}
              {post.featuredCountry && (
                <Link href={`/destinations/${post.featuredCountry.slug}`}
                  className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                  <div>
                    <p className="font-inter text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Destination</p>
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
                  <p className="font-inter text-[9px] uppercase tracking-[0.18em] text-gold-400/60 mb-1">Explore</p>
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
                className="flex items-center gap-2 justify-center font-inter text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted hover:text-charcoal/55 transition-colors py-2">
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
            <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-6">Also Read</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {alsoRead.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group block bg-white dark-flip-card rounded-2xl overflow-hidden border border-line dark-flip-border hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={blogCoverUrl(r.slug, 400)}
                      alt={r.title} fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    {r.category && (
                      <p className="font-inter text-[8px] uppercase tracking-[0.14em] text-crimson mb-2">{r.category}</p>
                    )}
                    <h3 className="font-display font-bold text-[13px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug line-clamp-2"
                      style={{ letterSpacing: '-0.01em' }}>
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="font-sans text-[11px] text-charcoal/45 dark-flip-muted leading-relaxed mt-2 line-clamp-2">{r.excerpt}</p>
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
