'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  title: string
  slug: string
  publishedAt?: string
  excerpt?: string
  category?: string
  tags?: string[]
  author?: { name: string }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Destinations',
  'Culture & Heritage',
  'Travel Planning',
  'Food Tourism',
  'Experiences',
]

const CATEGORY_COLOR: Record<string, string> = {
  'Destinations':       '#B55D39',
  'Culture & Heritage': '#3F6A3D',
  'Travel Planning':    '#A22E29',
  'Food Tourism':       '#D5A942',
  'Experiences':        '#3B403E',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── BlogGrid ──────────────────────────────────────────────────────────────────

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active)

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-line dark-flip-border">
        {CATEGORIES.map(cat => {
          const accent = CATEGORY_COLOR[cat]
          const isActive = active === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`font-mono text-[9px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-all ${
                isActive
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-transparent text-charcoal/45 dark-flip-muted border-line dark-flip-border hover:border-charcoal/30 hover:text-charcoal/65 dark:hover:text-cream/55'
              }`}
              style={isActive && accent ? { backgroundColor: accent, borderColor: accent } : {}}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-sans text-sm text-charcoal/35 dark-flip-muted italic">
            No articles in this category yet. More coming soon.
          </p>
        </div>
      ) : (
        <>
          {/* Featured post */}
          <FeaturedPost post={filtered[0]} />

          {/* Rest of posts */}
          {filtered.length > 1 && (
            <>
              <div className="mt-12 mb-6 flex items-baseline gap-4">
                <h2
                  className="font-display font-bold text-charcoal dark-flip-text"
                  style={{ fontSize: 'clamp(15px, 1.8vw, 21px)', letterSpacing: '-0.015em' }}
                >
                  {active === 'All' ? 'All Articles' : active}
                </h2>
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/25 dark-flip-muted">
                  {filtered.length - 1} more
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.slice(1).map(post => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── FeaturedPost ──────────────────────────────────────────────────────────────

function FeaturedPost({ post }: { post: BlogPost }) {
  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="grid lg:grid-cols-[3fr_2fr] rounded-3xl overflow-hidden border border-line dark-flip-border hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all duration-300">

        {/* Image */}
        <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[340px] overflow-hidden">
          <Image
            src={`https://picsum.photos/seed/${post.slug}-cover/900/600`}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          {/* Category overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/20"/>
          {post.category && (
            <span
              className="absolute top-4 left-4 font-mono text-[8px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full text-cream"
              style={{ backgroundColor: accent + 'ee' }}
            >
              {post.category}
            </span>
          )}
        </div>

        {/* Text panel */}
        <div className="bg-cream dark-flip-card p-7 lg:p-10 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-4">
              Featured Article
            </p>
            <h2
              className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-4"
              style={{ fontSize: 'clamp(17px, 2vw, 26px)', letterSpacing: '-0.018em', lineHeight: '1.1' }}
            >
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="font-sans text-[13px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-3 mb-5">
                {post.excerpt}
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-5">
              {post.author && (
                <span className="font-mono text-[9px] text-charcoal/45 dark-flip-muted uppercase tracking-[0.1em]">
                  {post.author.name}
                </span>
              )}
              {post.publishedAt && (
                <span className="font-mono text-[9px] text-charcoal/28 dark-flip-muted">
                  {formatDate(post.publishedAt)}
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-crimson group-hover:text-crimson/70 transition-colors">
              Read the full article &#8594;
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  const accent = post.category ? (CATEGORY_COLOR[post.category] ?? '#B55D39') : '#B55D39'
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden hover:shadow-[var(--shadow-soft)] transition-all duration-200"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${post.slug}-cover/600/340`}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        {post.category && (
          <span
            className="absolute top-3 left-3 font-mono text-[8px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-cream"
            style={{ backgroundColor: accent + 'ee' }}
          >
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-2 line-clamp-2"
          style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', letterSpacing: '-0.012em', lineHeight: '1.2' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {post.author && (
              <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted uppercase tracking-[0.1em]">
                {post.author.name}
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors shrink-0">
            Read &#8594;
          </span>
        </div>
      </div>
    </Link>
  )
}
