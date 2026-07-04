import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries'
import { AUTHORS, getAuthorBySlug } from '@/lib/authors'
import { FALLBACK_POSTS } from '@/lib/fallbackPosts'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  title: string
  slug: string
  publishedAt?: string
  excerpt?: string
  category?: string
  author?: { name: string }
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return AUTHORS.map(a => ({ slug: a.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) return {}

  const title       = `${author.name} – MyAfroWaka`
  const description = author.bio
  const canonicalUrl = `https://myafrowaka.com/authors/${slug}`
  const ogImage = `https://images.unsplash.com/photo-${author.avatarId}?auto=format&fit=crop&w=1200&q=80`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: canonicalUrl,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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

const BLOG_COVERS: Record<string, string> = {
  'lagos-rush-hour-city-life':              '67ruAEYmp4c',
  'kumasi-central-market-west-africa':      'w-jFW9XkDBg',
  'slow-travel-rwanda':                     '1ihYfuwRZds',
  'namib-desert-first-light':               '2vSQw0Qxi5c',
  'west-africa-food-culture':               'lNIy1gZUWwc',
  'zanzibar-stone-town-doors':              'XSgMLCn3cMs',
  'marrakech-djemaa-el-fna-guide':          'CFKksjYRSQ8',
  'victoria-falls-zimbabwe-guide':          'nsm-gUKDMeQ',
  'maasai-mara-wildebeest-migration-kenya': '7T6BXB4ahZw',
  'cape-town-winter-travel-guide':          'byUDvQhsh4U',
  'addis-ababa-walking-guide':              'qEGQxK8NFN4',
}

function blogCoverUrl(slug: string, width = 600) {
  const id = BLOG_COVERS[slug]
  return id
    ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`
    : `https://images.unsplash.com/photo-1ihYfuwRZds?auto=format&fit=crop&w=${width}&q=80`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuthorPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) notFound()

  // Fetch all Sanity posts, filter by author name
  const sanityPosts = await client.fetch<Post[]>(ALL_POSTS_QUERY).catch(() => [] as Post[])
  const sanityByAuthor = sanityPosts.filter(p => p.author?.name === author.name)

  // Fallback posts filtered by author name
  const fallbackByAuthor = FALLBACK_POSTS.filter(
    p => p.author.name === author.name &&
    !sanityByAuthor.find(sp => sp.slug === p.slug)
  )

  const posts: Post[] = [
    ...sanityByAuthor,
    ...fallbackByAuthor,
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: `https://myafrowaka.com/authors/${slug}`,
    worksFor: {
      '@type': 'Organization',
      name: 'MyAfroWaka',
      url: 'https://myafrowaka.com',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-ink border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-14">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start sm:items-center">

            {/* Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gold-400/30 shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Image
                src={`https://images.unsplash.com/photo-${author.avatarId}?auto=format&fit=crop&w=256&q=80&crop=faces`}
                alt={author.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div>
              <p className="font-inter text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-2">
                Contributor
              </p>
              <h1
                className="font-display font-extrabold text-cream"
                style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: '1.0', letterSpacing: '-0.025em' }}
              >
                {author.name}
              </h1>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-base">{author.countryFlag}</span>
                <span className="font-inter text-[10px] uppercase tracking-[0.16em] text-cream/45">
                  {author.country}
                </span>
              </div>
              {/* Expertise tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {author.expertise.map(tag => (
                  <span
                    key={tag}
                    className="font-inter text-[8px] uppercase tracking-[0.14em] text-cream/55 border border-white/12 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">

            {/* ── Bio sidebar ──────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-4">
                  About
                </p>
                <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-[1.8]">
                  {author.fullBio}
                </p>
              </div>

              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-inter text-[9px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted hover:text-crimson transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                </svg>
                All articles
              </Link>
            </div>

            {/* ── Articles ─────────────────────────────────────────── */}
            <div>
              <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-6">
                Articles
              </p>

              {posts.length === 0 ? (
                <p className="font-sans text-sm text-charcoal/35 dark-flip-muted italic">
                  Articles coming soon.
                </p>
              ) : (
                <div className="space-y-5">
                  {posts.map(post => {
                    const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
                    return (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group block bg-sand dark-flip-surf border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all duration-200"
                      >
                        <div className="flex gap-0 flex-col sm:flex-row">
                          {/* Cover */}
                          <div className="relative sm:w-52 h-40 sm:h-auto shrink-0 overflow-hidden">
                            <Image
                              src={blogCoverUrl(post.slug, 400)}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            />
                            {post.category && (
                              <span
                                className="absolute top-3 left-3 font-inter text-[7px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-cream"
                                style={{ backgroundColor: accent + 'ee' }}
                              >
                                {post.category}
                              </span>
                            )}
                          </div>

                          {/* Text */}
                          <div className="p-5 flex flex-col justify-between">
                            <div>
                              <h2
                                className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-2 line-clamp-2"
                                style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', letterSpacing: '-0.012em', lineHeight: '1.2' }}
                              >
                                {post.title}
                              </h2>
                              {post.excerpt && (
                                <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed line-clamp-2 mb-3">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              {post.publishedAt && (
                                <span className="font-inter text-[9px] text-charcoal/30 dark-flip-muted">
                                  {formatDate(post.publishedAt)}
                                </span>
                              )}
                              <span className="font-inter text-[9px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors shrink-0">
                                Read &#8594;
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
