import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from 'next-sanity'
import { atLeast } from '@/lib/roles'
import type { UserRole } from '@/types/next-auth'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 2)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_DOT: Record<string, string> = {
  Published:      'bg-gold-400',
  Verified:       'bg-moss-400',
  Draft:          'bg-white/25',
  Incomplete:     'bg-ochre-400',
  'Needs Update': 'bg-crimson/70',
  Archived:       'bg-white/10',
}

const STATUS_TEXT: Record<string, string> = {
  Published:      'text-gold-400',
  Verified:       'text-moss-400',
  Draft:          'text-cream/40',
  Incomplete:     'text-ochre-400',
  'Needs Update': 'text-crimson/80',
  Archived:       'text-cream/20',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session || !atLeast((session.user?.role ?? 'visitor') as UserRole, 'contributor')) {
    redirect('/')
  }

  const [
    allStatuses,
    recentUsers,
    publishingQueue,
    recentActivity,
    geoRaw,
    seoStats,
  ] = await Promise.all([
    readClient.fetch<(string | null)[]>(`*[_type == "attraction"].contentStatus`),
    readClient.fetch<{ userName: string; userEmail: string; role: string; createdAt: string }[]>(`
      *[_type == "userRole"] | order(createdAt desc) [0..4] {
        userName, userEmail, role, createdAt
      }
    `),
    readClient.fetch<{ name: string; slug: string; country?: { name: string }; _updatedAt: string }[]>(`
      *[_type == "attraction" && contentStatus == "Verified"] | order(_updatedAt desc) [0..4]{
        name, "slug": slug.current, _updatedAt,
        "country": country->{ name }
      }
    `),
    readClient.fetch<{ name: string; slug: string; contentStatus: string; _updatedAt: string; country?: { name: string } }[]>(`
      *[_type == "attraction"] | order(_updatedAt desc) [0..8]{
        name, "slug": slug.current, contentStatus, _updatedAt,
        "country": country->{ name }
      }
    `),
    readClient.fetch<{ region: string; status: string }[]>(`
      *[_type == "attraction"]{
        "region": coalesce(continentRegion, "Unknown"),
        "status": contentStatus
      }
    `),
    readClient.fetch<{ withMeta: number; published: number }>(`{
      "withMeta": count(*[_type == "attraction" && contentStatus == "Published" && defined(metaTitle) && metaTitle != ""]),
      "published": count(*[_type == "attraction" && contentStatus == "Published"])
    }`),
  ])

  const count      = (status: string) => allStatuses.filter(s => s === status).length
  const total      = allStatuses.length
  const published  = count('Published')
  const verified   = count('Verified')
  const draft      = count('Draft')
  const incomplete = count('Incomplete')
  const needsUpd   = count('Needs Update')

  const pubPct   = total > 0 ? Math.round((published / total) * 100) : 0
  const seoScore = seoStats.published > 0 ? Math.round((seoStats.withMeta / seoStats.published) * 100) : 0

  // Geographic coverage
  const REGION_ORDER = ['East Africa','West Africa','Southern Africa','North Africa','Central Africa','Indian Ocean Islands','Unknown']
  const geoMap: Record<string, { pub: number; total: number }> = {}
  for (const row of geoRaw) {
    if (!geoMap[row.region]) geoMap[row.region] = { pub: 0, total: 0 }
    geoMap[row.region].total++
    if (row.status === 'Published') geoMap[row.region].pub++
  }
  const geoRows = REGION_ORDER.filter(r => geoMap[r]).map(r => ({
    region: r,
    pub: geoMap[r].pub,
    total: geoMap[r].total,
    pct: Math.round((geoMap[r].pub / geoMap[r].total) * 100),
  }))

  return (
    <div className="space-y-5">

      {/* ── Header + Quick Actions ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400/60 mb-1">MyAfroWaka</p>
          <h1 className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.02em' }}>
            Admin Overview
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/user-dashboard/admin/new-attraction"
            className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson/85 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-4 py-2.5 rounded-xl transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Attraction
          </Link>
          <Link href="/user-dashboard/admin/new-post"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/12 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-4 py-2.5 rounded-xl transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            New Post
          </Link>
          <Link href="/admin/seo"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/12 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-4 py-2.5 rounded-xl transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            SEO Audit
          </Link>
          <Link href="/" target="_blank"
            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/12 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-4 py-2.5 rounded-xl transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            View Site
          </Link>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Published % — big visual */}
        <div className="bg-gradient-to-br from-gold-400/12 to-gold-400/4 border border-gold-400/20 rounded-2xl p-5 relative overflow-hidden">
          <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-gold-400/60 mb-1">Published</p>
          <p className="font-display font-bold text-gold-400 mb-0.5" style={{ fontSize: 'clamp(28px,3vw,42px)', letterSpacing: '-0.02em' }}>
            {pubPct}%
          </p>
          <p className="font-sans text-[14px] text-cream/30">{published} of {total} live</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div className="h-full bg-gold-400/60 rounded-r-full" style={{ width: `${pubPct}%` }}/>
          </div>
        </div>

        {/* Verified queue */}
        <div className="bg-gradient-to-br from-moss-400/12 to-moss-400/4 border border-moss-400/20 rounded-2xl p-5 relative overflow-hidden">
          <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-moss-400/60 mb-1">Ready to Publish</p>
          <p className="font-display font-bold text-moss-400 mb-0.5" style={{ fontSize: 'clamp(28px,3vw,42px)', letterSpacing: '-0.02em' }}>
            {verified}
          </p>
          <p className="font-sans text-[14px] text-cream/30">Verified guides</p>
          <Link href="/admin/attractions?status=Verified" className="absolute inset-0"/>
        </div>

        {/* SEO health */}
        <div className="bg-gradient-to-br from-crimson/10 to-crimson/3 border border-crimson/20 rounded-2xl p-5 relative overflow-hidden">
          <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson/60 mb-1">SEO Coverage</p>
          <p className="font-display font-bold text-cream mb-0.5" style={{ fontSize: 'clamp(28px,3vw,42px)', letterSpacing: '-0.02em' }}>
            {seoScore}%
          </p>
          <p className="font-sans text-[14px] text-cream/30">{seoStats.withMeta}/{seoStats.published} with meta</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div className="h-full bg-crimson/60 rounded-r-full" style={{ width: `${seoScore}%` }}/>
          </div>
        </div>

        {/* Needs attention */}
        <div className={`border rounded-2xl p-5 relative overflow-hidden ${needsUpd > 0 ? 'bg-gradient-to-br from-crimson/15 to-crimson/5 border-crimson/30' : 'bg-white/5 border-white/8'}`}>
          <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-cream/40 mb-1">Needs Update</p>
          <p className={`font-display font-bold mb-0.5 ${needsUpd > 0 ? 'text-crimson' : 'text-cream/30'}`}
            style={{ fontSize: 'clamp(28px,3vw,42px)', letterSpacing: '-0.02em' }}>
            {needsUpd}
          </p>
          <p className="font-sans text-[14px] text-cream/30">Flagged for review</p>
          {needsUpd > 0 && <Link href="/admin/attractions?status=Needs+Update" className="absolute inset-0"/>}
        </div>
      </div>

      {/* ── Publishing Queue + Recent Activity ───────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Publishing Queue */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-moss-400/70 mb-0.5">Ready to Publish</p>
              <p className="font-display font-semibold text-cream text-[14px]">Publishing Queue</p>
            </div>
            <Link href="/admin/attractions"
              className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400/60 hover:text-gold-400 transition-colors">
              View all
            </Link>
          </div>
          {publishingQueue.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="font-sans text-[14px] text-cream/30">No verified attractions waiting.</p>
              <p className="font-sans text-[14px] text-cream/20 mt-1">Verify a draft to see it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {publishingQueue.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 group">
                  <div className="min-w-0 mr-3">
                    <p className="font-display font-semibold text-[14px] text-cream/80 group-hover:text-cream transition-colors truncate"
                      style={{ letterSpacing: '-0.008em' }}>
                      {a.name}
                    </p>
                    {a.country && (
                      <p className="font-sans text-[14px] text-cream/30 mt-0.5">{a.country.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-sans text-[14px] text-cream/25">{timeAgo(a._updatedAt)}</span>
                    <Link href={`/attractions/${a.slug}`} target="_blank"
                      className="font-sans text-[14px] uppercase tracking-[0.1em] bg-moss-400/15 hover:bg-moss-400/25 text-moss-400 border border-moss-400/25 px-2.5 py-1 rounded-full transition-colors">
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-cream/35 mb-0.5">Latest Changes</p>
              <p className="font-display font-semibold text-cream text-[14px]">Recent Activity</p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${STATUS_DOT[a.contentStatus] ?? 'bg-white/15'}`}/>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[14px] text-cream/75 truncate">{a.name}</p>
                  <p className="font-sans text-[14px] text-cream/25 mt-0.5">
                    {a.country?.name ?? ''}{a.country ? ' · ' : ''}<span className={STATUS_TEXT[a.contentStatus] ?? 'text-cream/20'}>{a.contentStatus}</span>
                  </p>
                </div>
                <span className="font-sans text-[14px] text-cream/20 shrink-0">{timeAgo(a._updatedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Geographic Coverage + Status Breakdown ───────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Geographic coverage */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-cream/35 mb-5">Geographic Coverage</p>
          <div className="space-y-4">
            {geoRows.map(row => (
              <div key={row.region}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-sans text-[14px] text-cream/65">{row.region}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[14px] text-cream/35">{row.pub}/{row.total}</span>
                    <span className="font-sans text-[14px] text-gold-400/80 w-8 text-right">{row.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-400/55 rounded-full transition-all"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-cream/35 mb-5">Status Breakdown</p>
          <div className="space-y-3">
            {[
              { status: 'Published',    cnt: published  },
              { status: 'Verified',     cnt: verified   },
              { status: 'Draft',        cnt: draft      },
              { status: 'Incomplete',   cnt: incomplete },
              { status: 'Needs Update', cnt: needsUpd   },
            ].sort((a, b) => b.cnt - a.cnt).map(s => (
              <div key={s.status} className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[s.status] ?? 'bg-white/15'}`}/>
                <span className="font-sans text-[14px] uppercase tracking-[0.1em] text-cream/40 w-28 shrink-0">{s.status}</span>
                <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-400/60 rounded-full"
                    style={{ width: `${total > 0 ? (s.cnt / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-sans text-[14px] text-cream/50 w-8 text-right shrink-0">{s.cnt}</span>
              </div>
            ))}
          </div>

          {/* Pipeline links */}
          <div className="mt-6 pt-5 border-t border-white/8 grid grid-cols-2 gap-2">
            <Link href="/admin/attractions"
              className="bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl p-3 group transition-all">
              <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-gold-400/50 mb-1">Pipeline</p>
              <p className="font-display font-semibold text-cream text-[14px] group-hover:text-gold-300 transition-colors">Manage Attractions</p>
            </Link>
            {session.user?.role === 'admin' && (
              <Link href="/admin/users"
                className="bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl p-3 group transition-all">
                <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-gold-400/50 mb-1">Team</p>
                <p className="font-display font-semibold text-cream text-[14px] group-hover:text-gold-300 transition-colors">Manage Users</p>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Sign-ins ───────────────────────────────────────────── */}
      {recentUsers.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-cream/35">Recent Sign-ins</p>
            {session.user?.role === 'admin' && (
              <Link href="/admin/users" className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400/60 hover:text-gold-400 transition-colors">
                View all
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400/30 to-gold-600/20 border border-gold-400/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-[14px] text-gold-400">
                    {u.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-[14px] text-cream/75 truncate">{u.userName}</p>
                  <span className={`font-sans text-[14px] uppercase tracking-[0.1em] ${
                    u.role === 'admin'         ? 'text-gold-400' :
                    u.role === 'author-editor' ? 'text-ochre-300' :
                    u.role === 'contributor'   ? 'text-moss-400' :
                    u.role === 'moderator'     ? 'text-cream/40' :
                    'text-cream/25'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
