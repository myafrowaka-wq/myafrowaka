import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  title: string
  slug: string
  publishedAt?: string
  excerpt?: string
  category?: string
  tags?: string[]
  coverImage?: { asset?: { _ref: string } }
  author?: { name: string }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Blog – MyAfroWaka',
  description: 'Stories, guides, and culture from across the African continent. Written by people who have been there.',
  openGraph: {
    title: 'Blog – MyAfroWaka',
    description: 'Stories, guides, and culture from across the African continent.',
    type: 'website',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Destinations', 'Culture & Heritage', 'Travel Planning', 'Food Tourism', 'Experiences']

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  const posts = await client.fetch<Post[]>(ALL_POSTS_QUERY)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MyAfroWaka Blog',
    description: 'Stories, guides, and culture from across the African continent.',
    url: 'https://myafrowaka.com/blog',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[360px] flex items-end">
        <Image
          src="https://picsum.photos/seed/blog-hero-africa-stories/1920/720"
          alt="Stories from Africa"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/55 to-ink/98"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          <nav className="flex flex-wrap gap-1 items-center font-mono text-[9px] uppercase tracking-[0.14em] text-cream/40 mb-6">
            <Link href="/" className="hover:text-cream/75 transition-colors">Home</Link>
            <span className="text-cream/20">/</span>
            <span className="text-cream/65">Blog</span>
          </nav>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-3">
            Stories from the Continent
          </p>
          <h1
            className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(32px, 5.5vw, 68px)', lineHeight: '0.92', letterSpacing: '-0.03em' }}
          >
            The MyAfroWaka<br className="hidden sm:block"/> Journal
          </h1>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">

          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Featured post */}
              {posts[0] && <FeaturedPost post={posts[0]} />}

              {/* Category label */}
              {posts.length > 1 && (
                <div className="mt-14 mb-7 flex items-baseline justify-between">
                  <h2 className="font-display font-bold text-charcoal dark-flip-text"
                    style={{ fontSize: 'clamp(16px, 2vw, 22px)', letterSpacing: '-0.015em' }}>
                    All Articles
                  </h2>
                </div>
              )}

              {/* Grid */}
              {posts.length > 1 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(1).map(post => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeaturedPost({ post }: { post: Post }) {
  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-line dark-flip-border hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
        <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
          <Image
            src={`https://picsum.photos/seed/${post.slug}-cover/800/500`}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="bg-cream dark-flip-card p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full text-cream"
              style={{ backgroundColor: accent }}>
              {post.category ?? 'Article'}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/28 dark-flip-muted">
              Featured
            </span>
          </div>
          <h2 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-3"
            style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', letterSpacing: '-0.018em', lineHeight: '1.1' }}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="font-sans text-[13px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-3 mb-5">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {post.author && (
              <span className="font-mono text-[9px] text-charcoal/40 dark-flip-muted uppercase tracking-[0.1em]">
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <span className="font-mono text-[9px] text-charcoal/30 dark-flip-muted">
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-crimson group-hover:text-crimson/70 transition-colors">
            Read article &#8594;
          </p>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: Post }) {
  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
  return (
    <Link href={`/blog/${post.slug}`}
      className="group block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${post.slug}-cover/600/340`}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        {post.category && (
          <span className="absolute top-3 left-3 font-mono text-[8px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-cream"
            style={{ backgroundColor: accent + 'ee' }}>
            {post.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-[15px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-2 line-clamp-2"
          style={{ letterSpacing: '-0.012em', lineHeight: '1.2' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {post.author && (
              <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted uppercase tracking-[0.1em]">
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <span className="font-mono text-[9px] text-charcoal/25 dark-flip-muted">
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors shrink-0">
            Read &#8594;
          </p>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sand dark-flip-surf border border-line dark-flip-border mb-6">
        <svg className="w-6 h-6 text-charcoal/25 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.5-4.5A2 2 0 0013.5 3H5"/>
        </svg>
      </div>
      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-2"
        style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.015em' }}>
        First articles coming soon
      </h2>
      <p className="font-sans text-sm text-charcoal/45 dark-flip-muted max-w-sm mx-auto mb-8 leading-relaxed">
        The MyAfroWaka Journal is being prepared. Start in Sanity Studio to publish your first article.
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link href="/search"
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
          Browse attractions &#8594;
        </Link>
        <Link href="/studio"
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted hover:text-charcoal/65 transition-colors">
          Open Studio &#8594;
        </Link>
      </div>
    </div>
  )
}
