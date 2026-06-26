import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { client } from '@/sanity/lib/client'
import type { UserRole } from '@/types/next-auth'

export const metadata: Metadata = {
  title: 'My Dashboard – MyAfroWaka',
  robots: { index: false, follow: false },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedEntry {
  attractionSlug: string
  savedAt: string
  attraction?: {
    name: string
    slug: string
    type?: string[]
    editorialSummary?: string
    country?: { name: string }
  }
}

interface UserRecord {
  userId: string
  userEmail: string
  userName: string
  role: string
  createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_ORDER: UserRole[] = ['visitor', 'subscriber', 'moderator', 'contributor', 'author-editor', 'admin']

function atLeast(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minRole)
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDashDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function accentGradient(slug: string): string {
  const palette = [
    'from-crimson/70 to-ochre/60',
    'from-forest/70 to-gold-400/60',
    'from-gold-400/70 to-crimson/60',
    'from-ink/70 to-forest/60',
  ]
  return palette[slug.charCodeAt(0) % palette.length]
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  subscriber:      'Discover Africa\'s most remarkable places. Save the ones that call to you.',
  moderator:       'Help keep the database accurate. Review and resolve reported errors.',
  contributor:     'Share what you know. Submit new attractions and local insights.',
  'author-editor': 'Shape how the world understands Africa. Write, edit, and publish guides.',
  admin:           'Full platform control. Manage content, users, and site settings.',
  visitor:         'Explore Africa\'s most remarkable places.',
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  subscriber:      { label: 'Subscriber',  cls: 'bg-charcoal/8 dark-flip-surf text-charcoal/60 dark-flip-muted'  },
  moderator:       { label: 'Moderator',   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  contributor:     { label: 'Contributor', cls: 'bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-300'  },
  'author-editor': { label: 'Author',      cls: 'bg-ochre/10 text-ochre dark:bg-ochre/20'                          },
  admin:           { label: 'Admin',       cls: 'bg-crimson/10 text-crimson dark:bg-crimson/20'                    },
  visitor:         { label: 'Visitor',     cls: 'bg-charcoal/8 text-charcoal/50'                                   },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, bg }: {
  label: string; value: number | string; icon: ReactNode; bg: string
}) {
  return (
    <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-5 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
        {icon}
      </div>
      <p className="font-display font-extrabold text-charcoal dark-flip-text"
        style={{ fontSize: 'clamp(28px, 3vw, 38px)', letterSpacing: '-0.03em', lineHeight: '1' }}>
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mt-2">
        {label}
      </p>
    </div>
  )
}

function SectionHead({ title, icon, aside }: {
  title: string; icon: ReactNode; aside?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0 text-gold-400">
          {icon}
        </div>
        <h2 className="font-display font-bold text-charcoal dark-flip-text"
          style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', letterSpacing: '-0.015em' }}>
          {title}
        </h2>
      </div>
      {aside}
    </div>
  )
}

// ── SVG icons (reused inline) ─────────────────────────────────────────────────

const icons = {
  heart: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  check: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  plus:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4"/></svg>,
  pen:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  users: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  home:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  map:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>,
  clip:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UserDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const { user } = session
  const role = (user.role ?? 'subscriber') as UserRole
  const rm = ROLE_BADGE[role] ?? ROLE_BADGE.subscriber
  const firstName = (user.name ?? user.email ?? 'Explorer').split(' ')[0]

  // ── Data fetching ──────────────────────────────────────────────────────────

  const saved = await client.fetch<SavedEntry[]>(
    `*[_type == "savedAttraction" && userId == $userId] | order(savedAt desc) {
      attractionSlug, savedAt,
      "attraction": *[_type == "attraction" && slug.current == ^.attractionSlug][0] {
        name, "slug": slug.current, type, editorialSummary, "country": country->{ name }
      }
    }`,
    { userId: user.id }
  ).catch(() => [] as SavedEntry[])

  const articleCount = atLeast(role, 'author-editor')
    ? await client.fetch<number>(`count(*[_type == "post"])`).catch(() => 0)
    : 0

  const usersCount = atLeast(role, 'admin')
    ? await client.fetch<number>(`count(*[_type == "userRole"])`).catch(() => 0)
    : 0

  const allUsers = atLeast(role, 'admin')
    ? await client.fetch<UserRecord[]>(
        `*[_type == "userRole"] | order(createdAt desc)[0..29] {
          userId, userEmail, userName, role, createdAt
        }`
      ).catch(() => [] as UserRecord[])
    : null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 space-y-10">

        {/* ── 1. Welcome banner ────────────────────────────────────────── */}
        <section id="overview" className="scroll-mt-8">
          <div className="relative rounded-3xl overflow-hidden bg-ink p-7 sm:p-9">

            {/* Decorative Africa silhouette */}
            <div className="absolute right-6 top-6 w-36 h-40 opacity-[0.06] pointer-events-none" aria-hidden>
              <svg viewBox="0 0 200 260" className="w-full h-full fill-cream">
                <path d="M100 5 C60 5 20 30 10 70 C5 90 8 110 5 130 C2 155 10 175 20 195 C35 220 55 235 75 248 C90 258 105 260 115 250 C130 238 145 220 160 200 C175 178 185 155 190 130 C196 103 192 75 185 55 C175 30 140 5 100 5Z"/>
              </svg>
            </div>

            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="shrink-0 relative">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name ?? ''} width={62} height={62}
                    className="rounded-2xl ring-2 ring-gold-400/25 object-cover"/>
                ) : (
                  <div className="w-[62px] h-[62px] rounded-2xl bg-gradient-to-br from-crimson/80 to-ochre/70 flex items-center justify-center">
                    <span className="font-display font-extrabold text-2xl text-cream/90">
                      {firstName.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ink bg-moss"/>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-gold-400/55 mb-1.5">
                  {getDashDate()}
                </p>
                <h1 className="font-display font-extrabold text-cream"
                  style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.025em', lineHeight: '1.1' }}>
                  {getGreeting()}, {firstName}
                </h1>
                <p className="font-sans text-cream/45 mt-1.5 leading-relaxed text-[13px] max-w-lg">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
                <div className="flex items-center gap-2.5 mt-4 flex-wrap">
                  <span className={`font-mono text-[7.5px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full ${rm.cls}`}>
                    {rm.label}
                  </span>
                  <span className="font-mono text-[8px] text-cream/25 truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick actions row ─────────────────────────────────────────── */}
        <div className={`grid gap-3 ${atLeast(role, 'admin') ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {[
            { label: 'Explore Africa',  href: '/search',      icon: 'map',    accent: 'text-forest bg-forest/10'  },
            { label: 'The Journal',     href: '/blog',        icon: 'pen',    accent: 'text-ochre bg-ochre/10'    },
            { label: 'Plan a Trip',     href: '/plan-a-trip', icon: 'map',    accent: 'text-gold-600 bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400' },
            ...(atLeast(role, 'admin') ? [
              { label: 'New Article',   href: '/user-dashboard/admin/new-post',       icon: 'pen',   accent: 'text-crimson bg-crimson/10' },
            ] : [
              { label: 'Contact',       href: '/contact',     icon: 'clip',   accent: 'text-charcoal/50 bg-charcoal/6 dark:text-cream/50 dark:bg-cream/8' },
            ]),
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="group flex items-center gap-3 bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${a.accent}`}>
                {a.icon === 'pen' ? icons.pen : a.icon === 'map' ? icons.map : icons.clip}
              </div>
              <span className="font-display font-semibold text-[12px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-tight">
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ── 2. Stats cards ───────────────────────────────────────────── */}
        <div className={`grid gap-4 ${atLeast(role, 'admin') ? 'grid-cols-2 lg:grid-cols-4' : atLeast(role, 'author-editor') ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          <StatCard
            label="Saved Attractions"
            value={saved.length}
            bg="bg-crimson/10 text-crimson"
            icon={icons.heart}
          />
          {atLeast(role, 'author-editor') && (
            <StatCard
              label="Published Articles"
              value={articleCount}
              bg="bg-gold-50 text-gold-600 dark:bg-gold-900/20 dark:text-gold-400"
              icon={icons.pen}
            />
          )}
          {atLeast(role, 'admin') && (
            <>
              <StatCard
                label="Registered Users"
                value={usersCount}
                bg="bg-forest/10 text-forest dark:bg-forest/20"
                icon={icons.users}
              />
              <StatCard
                label="Corrections Queue"
                value={0}
                bg="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                icon={icons.check}
              />
            </>
          )}
        </div>

        {/* ── 3. Saved attractions ─────────────────────────────────────── */}
        <section id="saved" className="scroll-mt-8">
          <SectionHead
            title="Saved Attractions"
            icon={icons.heart}
            aside={saved.length > 0 ? (
              <Link href="/search"
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                Browse more &#8594;
              </Link>
            ) : undefined}
          />

          {saved.length === 0 ? (
            <div className="border border-dashed border-line dark-flip-border rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-crimson/8 flex items-center justify-center mx-auto mb-4 text-crimson">
                {icons.heart}
              </div>
              <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1.5">
                Your list is empty
              </p>
              <p className="font-sans text-[13px] text-charcoal/45 dark-flip-muted mb-5 max-w-xs mx-auto leading-relaxed">
                Browse Africa's most remarkable places and tap the heart to save them here.
              </p>
              <Link href="/search"
                className="inline-flex items-center gap-2 bg-ink hover:bg-charcoal text-cream font-mono text-[9px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-full transition-colors">
                {icons.map}
                <span>Explore Attractions</span>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {saved.map(entry => {
                const a = entry.attraction
                if (!a) return null
                const typeLabel = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') ?? ''
                const seed = a.slug.split('').reduce((n, c) => n + c.charCodeAt(0), 0)
                return (
                  <Link
                    key={entry.attractionSlug}
                    href={`/attractions/${a.slug}`}
                    className="group block rounded-2xl overflow-hidden border border-line dark-flip-border hover:border-gold-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] transition-all bg-cream dark-flip-card"
                  >
                    {/* Image area */}
                    <div className="relative h-40 overflow-hidden bg-sand dark-flip-surf">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://picsum.photos/seed/${seed}/600/300`}
                        alt={a.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {typeLabel && (
                        <span className="absolute top-3 left-3 font-mono text-[7px] uppercase tracking-[0.16em] bg-ink/70 text-cream/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {typeLabel}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent"/>
                    </div>

                    <div className="p-4">
                      <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-0.5"
                        style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', letterSpacing: '-0.012em' }}>
                        {a.name}
                      </h3>
                      {a.country && (
                        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-charcoal/30 dark-flip-muted">
                          {a.country.name}
                        </p>
                      )}
                      {a.editorialSummary && (
                        <p className="font-sans text-[11px] text-charcoal/45 dark-flip-muted leading-relaxed line-clamp-2 mt-2.5">
                          {a.editorialSummary}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── 4. Corrections inbox (Moderator+) ────────────────────────── */}
        {atLeast(role, 'moderator') && (
          <section id="corrections" className="scroll-mt-8">
            <SectionHead title="Corrections Inbox" icon={icons.check}
              aside={
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted bg-charcoal/6 dark-flip-surf px-3 py-1.5 rounded-full">
                  0 pending
                </span>
              }
            />
            <div className="border border-line dark-flip-border rounded-2xl overflow-hidden">
              <div className="bg-sand dark-flip-surf border-b border-line dark-flip-border px-6 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-charcoal/15"/>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-charcoal/30 dark-flip-muted">Queue</p>
              </div>
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-charcoal/6 dark-flip-surf flex items-center justify-center mx-auto mb-4 text-charcoal/25 dark-flip-muted">
                  {icons.clip}
                </div>
                <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1.5">
                  No pending corrections
                </p>
                <p className="font-sans text-[13px] text-charcoal/40 dark-flip-muted max-w-sm mx-auto leading-relaxed">
                  When visitors submit factual corrections, they will appear here for your review. Full workflow coming in the next update.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── 5. Submit attraction (Contributor+) ──────────────────────── */}
        {atLeast(role, 'contributor') && (
          <section id="submit" className="scroll-mt-8">
            <SectionHead title="Submit an Attraction" icon={icons.plus}/>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/contact"
                className="group block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
                <div className="w-9 h-9 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mb-4 text-gold-600 dark:text-gold-400 border border-gold-100 dark:border-gold-800/30">
                  {icons.map}
                </div>
                <p className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-1">
                  Submit via contact form
                </p>
                <p className="font-sans text-[12px] text-charcoal/45 dark-flip-muted leading-relaxed">
                  Send us the name, location, and why it deserves a guide.
                </p>
              </Link>
              {atLeast(role, 'admin') ? (
                <Link href="/user-dashboard/admin/new-attraction"
                  className="group bg-crimson/5 border border-crimson/20 hover:border-crimson/40 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:shadow-[0_4px_16px_rgba(162,46,41,0.08)]">
                  <div className="w-9 h-9 rounded-xl bg-crimson/12 flex items-center justify-center text-crimson">
                    {icons.plus}
                  </div>
                  <div>
                    <p className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-1">
                      Admin: Add to Sanity
                    </p>
                    <p className="font-sans text-[12px] text-charcoal/45 dark-flip-muted leading-relaxed">
                      Create the attraction record and push it directly to Sanity from here.
                    </p>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-crimson bg-crimson/10 px-2.5 py-1 rounded-full w-fit">
                    Admin only
                  </span>
                </Link>
              ) : (
                <div className="bg-sand dark-flip-surf border border-dashed border-line dark-flip-border rounded-2xl p-6 flex flex-col gap-4">
                  <div className="w-9 h-9 rounded-xl bg-charcoal/6 dark-flip-card flex items-center justify-center text-charcoal/25 dark-flip-muted">
                    {icons.plus}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[14px] text-charcoal/40 dark-flip-muted mb-1">
                      Structured submission form
                    </p>
                    <p className="font-sans text-[12px] text-charcoal/30 dark-flip-muted leading-relaxed">
                      A guided form for detailed attraction data. Coming soon.
                    </p>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/25 bg-charcoal/6 px-2.5 py-1 rounded-full w-fit">
                    In Development
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 6. Articles and Drafts (Author-Editor+) ──────────────────── */}
        {atLeast(role, 'author-editor') && (
          <section id="articles" className="scroll-mt-8">
            <SectionHead title="Articles and Drafts" icon={icons.pen}
              aside={
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/30 dark-flip-muted">
                  {articleCount} total
                </span>
              }
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <a href="/studio/desk/post"
                target="_blank" rel="noopener noreferrer"
                className="group sm:col-span-2 bg-ink hover:bg-charcoal rounded-2xl p-7 transition-colors block">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-gold-400/60 mb-4">Sanity Studio</p>
                <p className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors mb-1.5"
                  style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', letterSpacing: '-0.012em' }}>
                  Open Content Editor
                </p>
                <p className="font-sans text-[12px] text-cream/35 leading-relaxed">
                  Write, edit, and publish articles from the Sanity content editor. Full image upload, headings, and rich text.
                </p>
                <div className="mt-5 flex items-center gap-2 text-gold-400 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span>Open Studio</span>
                  <span>&#8594;</span>
                </div>
              </a>
              <div className="flex flex-col gap-4">
                <Link href="/blog"
                  className="group flex-1 block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-charcoal/30 dark-flip-muted mb-3">Published</p>
                  <p className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                    View The Journal
                  </p>
                  <p className="font-sans text-[11px] text-charcoal/40 dark-flip-muted mt-1">Live site view</p>
                </Link>
                {atLeast(role, 'admin') ? (
                  <Link href="/user-dashboard/admin/new-post"
                    className="group block bg-crimson/5 border border-crimson/20 hover:border-crimson/40 rounded-2xl p-5 transition-all">
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-crimson/60 mb-1">Quick write</p>
                    <p className="font-display font-bold text-[14px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                      New Article
                    </p>
                    <p className="font-sans text-[11px] text-charcoal/40 dark-flip-muted mt-1">Saves to Sanity</p>
                  </Link>
                ) : (
                  <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5">
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-charcoal/25 dark-flip-muted mb-3">Quick stat</p>
                    <p className="font-display font-extrabold text-charcoal dark-flip-text"
                      style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', letterSpacing: '-0.025em', lineHeight: '1' }}>
                      {articleCount}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted mt-1">
                      Articles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 7. Admin command centre ──────────────────────────────────── */}
        {atLeast(role, 'admin') && (
          <section id="admin-create" className="scroll-mt-8">
            <SectionHead title="Admin: Create Content" icon={icons.pen}
              aside={
                <a href="/studio" target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                  Sanity Studio &#8594;
                </a>
              }
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/user-dashboard/admin/new-post"
                className="group relative bg-ink hover:bg-charcoal rounded-3xl p-7 transition-colors overflow-hidden block">
                <div className="absolute right-0 top-0 w-24 h-24 opacity-5">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-cream"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-gold-400/55 mb-4">Editorial</p>
                <p className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors mb-1.5"
                  style={{ fontSize: 'clamp(16px, 2vw, 20px)', letterSpacing: '-0.015em' }}>
                  Write New Article
                </p>
                <p className="font-sans text-[12px] text-cream/35 leading-relaxed mb-5">
                  Draft a blog post. Fill in the title, body, and category. It lands in Sanity as a Draft ready for images.
                </p>
                <div className="flex items-center gap-2 text-gold-400 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span>Start writing</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </div>
              </Link>
              <Link href="/user-dashboard/admin/new-attraction"
                className="group relative bg-forest/90 hover:bg-forest rounded-3xl p-7 transition-colors overflow-hidden block">
                <div className="absolute right-0 top-0 w-28 h-28 opacity-5">
                  <svg viewBox="0 0 200 260" className="w-full h-full fill-cream"><path d="M100 5 C60 5 20 30 10 70 C5 90 8 110 5 130 C2 155 10 175 20 195 C35 220 55 235 75 248 C90 258 105 260 115 250 C130 238 145 220 160 200 C175 178 185 155 190 130 C196 103 192 75 185 55 C175 30 140 5 100 5Z"/></svg>
                </div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cream/40 mb-4">Destinations</p>
                <p className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors mb-1.5"
                  style={{ fontSize: 'clamp(16px, 2vw, 20px)', letterSpacing: '-0.015em' }}>
                  Add New Attraction
                </p>
                <p className="font-sans text-[12px] text-cream/35 leading-relaxed mb-5">
                  Create an attraction record in Sanity. Name it, set the region and type, and add the editorial summary. Add the full article later in Studio.
                </p>
                <div className="flex items-center gap-2 text-cream/70 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span>Add attraction</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ── 8. Admin: user management ────────────────────────────────── */}
        {atLeast(role, 'admin') && allUsers && (
          <section id="users" className="scroll-mt-8">
            <SectionHead title="User Management" icon={icons.users}
              aside={
                <a href="/studio/desk/userRole"
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                  Edit in Studio &#8594;
                </a>
              }
            />

            <div className="border border-line dark-flip-border rounded-2xl overflow-hidden">
              {/* Header bar */}
              <div className="bg-sand dark-flip-surf border-b border-line dark-flip-border px-5 py-3 flex items-center justify-between">
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-charcoal/30 dark-flip-muted">
                  All registered users
                </p>
                <span className="font-mono text-[8px] text-charcoal/30 dark-flip-muted bg-charcoal/6 dark-flip-card px-2.5 py-1 rounded-full">
                  {usersCount} total
                </span>
              </div>

              {allUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-sans text-[13px] text-charcoal/35 dark-flip-muted italic">No user records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-line dark-flip-border">
                        <th className="text-left font-mono text-[7px] uppercase tracking-[0.18em] text-charcoal/25 dark-flip-muted px-5 py-3">Name</th>
                        <th className="text-left font-mono text-[7px] uppercase tracking-[0.18em] text-charcoal/25 dark-flip-muted px-5 py-3">Email</th>
                        <th className="text-left font-mono text-[7px] uppercase tracking-[0.18em] text-charcoal/25 dark-flip-muted px-5 py-3">Role</th>
                        <th className="text-left font-mono text-[7px] uppercase tracking-[0.18em] text-charcoal/25 dark-flip-muted px-5 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line dark-flip-border">
                      {allUsers.map(u => {
                        const rb = ROLE_BADGE[u.role] ?? ROLE_BADGE.subscriber
                        const joined = u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : ''
                        return (
                          <tr key={u.userId} className="bg-cream dark-flip-card hover:bg-sand dark-flip-surf/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-charcoal/8 dark-flip-surf flex items-center justify-center shrink-0">
                                  <span className="font-display font-bold text-[9px] text-charcoal/40 dark-flip-muted">
                                    {(u.userName || u.userEmail || 'U').slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-sans text-[13px] text-charcoal dark-flip-text">{u.userName || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-charcoal/50 dark-flip-muted">{u.userEmail}</td>
                            <td className="px-5 py-3.5">
                              <span className={`font-mono text-[7.5px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${rb.cls}`}>
                                {rb.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-charcoal/30 dark-flip-muted">{joined}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Footer quick links ────────────────────────────────────────── */}
        <footer className="border-t border-line dark-flip-border pt-6 pb-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'Browse Attractions', href: '/search'  },
              { label: 'The Journal',        href: '/blog'    },
              { label: 'Travel Guides',      href: '/guides'  },
              { label: 'Homepage',           href: '/'        },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/35 dark-flip-muted hover:text-crimson transition-colors">
                {link.label} &#8594;
              </Link>
            ))}
          </div>
        </footer>

      </div>
    </div>
  )
}
