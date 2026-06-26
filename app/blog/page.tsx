import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries'
import { BlogGrid, type BlogPost } from '@/components/BlogGrid'
import { FALLBACK_POSTS } from '@/lib/fallbackPosts'

const POSTS_PER_PAGE = 6

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'The Journal – MyAfroWaka',
  description: 'Perspectives, dispatches, and stories from across the continent. Written by people who have been there.',
  openGraph: {
    title: 'The MyAfroWaka Journal',
    description: 'Stories and perspectives from across the African continent.',
    type: 'website',
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPage(
  { searchParams }: { searchParams: Promise<{ page?: string }> }
) {
  const { page: pageParam } = await searchParams
  const page    = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const fetched = await client.fetch<BlogPost[]>(ALL_POSTS_QUERY).catch(() => [] as BlogPost[])
  const allPosts: BlogPost[] = fetched.length > 0 ? fetched : FALLBACK_POSTS

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * POSTS_PER_PAGE
  const posts      = allPosts.slice(start, start + POSTS_PER_PAGE)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The MyAfroWaka Journal',
    description: 'Perspectives, dispatches, and stories from across the continent.',
    url: 'https://myafrowaka.com/blog',
  }

  const featuredTitle = allPosts[0]?.title

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] md:min-h-[500px] flex items-end">
        <Image
          src="https://picsum.photos/seed/blog-hero-africa-stories-v2/1920/800"
          alt="The MyAfroWaka Journal"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/60 to-ink/98"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-14 pt-28">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">

            {/* Left: headline */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold-400 mb-4">
                MyAfroWaka
              </p>
              <h1
                className="font-display font-extrabold text-cream"
                style={{ fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: '0.88', letterSpacing: '-0.03em' }}
              >
                The<br/>Journal
              </h1>
              <p className="font-sans text-cream/45 mt-4"
                style={{ fontSize: 'clamp(12px, 1.2vw, 15px)' }}>
                Perspectives, dispatches, and stories from across the continent.
              </p>
            </div>

            {/* Right: latest teaser */}
            {featuredTitle && (
              <div className="border-l-2 border-gold-400/40 pl-5 max-w-xs shrink-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-gold-400/60 mb-2">Latest</p>
                <p className="font-display font-semibold text-cream/80 leading-snug line-clamp-2"
                  style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}>
                  {featuredTitle}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <BlogGrid posts={posts} />

          {/* ── Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2 flex-wrap">
              {safePage > 1 && (
                <Link href={`/blog?page=${safePage - 1}`}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <Link key={n} href={`/blog?page=${n}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-[13px] transition-all
                    ${n === safePage
                      ? 'bg-ink text-cream shadow-[var(--shadow-soft)]'
                      : 'border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {n}
                </Link>
              ))}
              {safePage < totalPages && (
                <Link href={`/blog?page=${safePage + 1}`}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}


