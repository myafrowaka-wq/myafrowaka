import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from 'next-sanity'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const STATUS_COLOR: Record<string, string> = {
  Published:      'text-gold-400',
  Verified:       'text-moss-400',
  Draft:          'text-cream/40',
  Incomplete:     'text-ochre-400',
  'Needs Update': 'text-crimson/80',
  Archived:       'text-cream/20',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'contributor')) {
    redirect('/')
  }

  const [stats, recentUsers] = await Promise.all([
    readClient.fetch<{ status: string; count: number }[]>(`
      array::unique(*[_type == "attraction"].contentStatus) {
        "status": @,
        "count": count(*[_type == "attraction" && contentStatus == @])
      }
    `),
    readClient.fetch<{ userName: string; userEmail: string; role: string; createdAt: string }[]>(`
      *[_type == "userRole"] | order(createdAt desc) [0..4] {
        userName, userEmail, role, createdAt
      }
    `),
  ])

  const total     = stats.reduce((sum, s) => sum + s.count, 0)
  const published = stats.find(s => s.status === 'Published')?.count ?? 0
  const verified  = stats.find(s => s.status === 'Verified')?.count ?? 0
  const draft     = stats.find(s => s.status === 'Draft')?.count ?? 0
  const incomplete = stats.find(s => s.status === 'Incomplete')?.count ?? 0
  const needsUpdate = stats.find(s => s.status === 'Needs Update')?.count ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400/60 mb-1">MyAfroWaka</p>
        <h1 className="font-display font-extrabold text-cream"
          style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.02em' }}>
          Admin Overview
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Total Attractions', value: total,      color: 'text-cream' },
          { label: 'Published',         value: published,  color: STATUS_COLOR['Published'] },
          { label: 'Ready to Publish',  value: verified,   color: STATUS_COLOR['Verified'] },
          { label: 'Draft',             value: draft,      color: STATUS_COLOR['Draft'] },
          { label: 'Incomplete',        value: incomplete,  color: STATUS_COLOR['Incomplete'] },
          { label: 'Needs Update',      value: needsUpdate, color: STATUS_COLOR['Needs Update'] },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/35 mb-2">{s.label}</p>
            <p className={`font-display font-bold text-3xl ${s.color}`} style={{ letterSpacing: '-0.02em' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/admin/attractions"
          className="bg-white/5 hover:bg-white/10 border border-white/8 rounded-2xl p-5 group transition-all">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-gold-400/60 mb-2">Pipeline</p>
          <p className="font-display font-bold text-cream text-base group-hover:text-gold-300 transition-colors" style={{ letterSpacing: '-0.01em' }}>
            Manage Attractions
          </p>
          <p className="font-sans text-[12px] text-cream/35 mt-1">Review, publish, and flag attractions.</p>
        </Link>

        {session.user?.role === 'admin' && (
          <Link href="/admin/users"
            className="bg-white/5 hover:bg-white/10 border border-white/8 rounded-2xl p-5 group transition-all">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-gold-400/60 mb-2">Team</p>
            <p className="font-display font-bold text-cream text-base group-hover:text-gold-300 transition-colors" style={{ letterSpacing: '-0.01em' }}>
              Manage Users
            </p>
            <p className="font-sans text-[12px] text-cream/35 mt-1">Assign roles and manage contributors.</p>
          </Link>
        )}
      </div>

      {/* Status breakdown */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/35 mb-5">Status Breakdown</p>
        <div className="space-y-3">
          {stats.sort((a, b) => b.count - a.count).map(s => (
            <div key={s.status} className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-cream/40 w-28 shrink-0">{s.status}</span>
              <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-400/60 rounded-full"
                  style={{ width: `${total > 0 ? (s.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-cream/50 w-8 text-right shrink-0">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent users */}
      {recentUsers.length > 0 && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cream/35">Recent Sign-ins</p>
            {session.user?.role === 'admin' && (
              <Link href="/admin/users" className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold-400/60 hover:text-gold-400 transition-colors">
                View all
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-[13px] text-cream/70">{u.userName}</p>
                  <p className="font-mono text-[9px] text-cream/30">{u.userEmail}</p>
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${
                  u.role === 'admin'       ? 'text-gold-400 border-gold-400/25 bg-gold-400/8' :
                  u.role === 'contributor' ? 'text-moss-400 border-moss-400/25 bg-moss-400/8' :
                  'text-cream/25 border-white/10'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
