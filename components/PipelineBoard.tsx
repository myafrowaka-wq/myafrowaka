'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Status = 'Draft' | 'Incomplete' | 'Verified' | 'Published' | 'Needs Update' | 'Archived' | 'All'

interface Attraction {
  _id: string
  name: string
  slug: string
  contentStatus: string
  continentRegion?: string
  lastVerifiedDate?: string
  country?: { name: string }
  type?: string[]
}

interface Props {
  attractions: Attraction[]
  role: string
}

const STATUS_TABS: Status[] = ['All', 'Draft', 'Incomplete', 'Verified', 'Published', 'Needs Update', 'Archived']

const STATUS_STYLE: Record<string, string> = {
  Draft:          'bg-charcoal/8 text-charcoal/55',
  Incomplete:     'bg-ochre-50 text-ochre-700',
  Verified:       'bg-moss-50 text-moss-700',
  Published:      'bg-gold-50 text-gold-700',
  'Needs Update': 'bg-crimson/8 text-crimson',
  Archived:       'bg-charcoal/5 text-charcoal/35',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center font-mono text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${STATUS_STYLE[status] ?? 'bg-charcoal/8 text-charcoal/40'}`}>
      {status}
    </span>
  )
}

export function PipelineBoard({ attractions, role }: Props) {
  const [activeTab, setActiveTab] = useState<Status>('All')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState<string | null>(null)
  const [data, setData]           = useState(attractions)

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: data.length }
    for (const a of data) c[a.contentStatus] = (c[a.contentStatus] ?? 0) + 1
    return c
  }, [data])

  const filtered = useMemo(() => {
    return data.filter(a => {
      const matchTab    = activeTab === 'All' || a.contentStatus === activeTab
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.country?.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [data, activeTab, search])

  async function changeStatus(id: string, status: string) {
    setLoading(id)
    try {
      const res = await fetch('/api/admin/attractions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setData(prev => prev.map(a => a._id === id ? { ...a, contentStatus: status } : a))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] px-3.5 py-2 rounded-full border transition-all ${
              activeTab === tab
                ? 'bg-ink text-cream border-ink'
                : 'bg-cream dark-flip-card border-line dark-flip-border text-charcoal/50 hover:border-charcoal/30'
            }`}
          >
            {tab}
            {counts[tab] != null && (
              <span className={`text-[8px] ${activeTab === tab ? 'text-cream/60' : 'text-charcoal/35'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name or country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 font-sans text-sm border border-line dark-flip-border bg-cream dark-flip-card text-charcoal dark-flip-text placeholder:text-charcoal/30 rounded-xl focus:outline-none focus:border-gold-400 transition-colors"
        />
      </div>

      {/* Results count */}
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted">
        {filtered.length} attraction{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-charcoal/40 dark-flip-muted">No attractions match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line dark-flip-border bg-sand dark-flip-surf">
                  <th className="text-left px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted">Attraction</th>
                  <th className="text-left px-4 py-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hidden md:table-cell">Country</th>
                  <th className="text-left px-4 py-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted">Status</th>
                  <th className="text-left px-4 py-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hidden lg:table-cell">Verified</th>
                  <th className="text-right px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((a, i) => (
                  <tr key={a._id}
                    className={`border-b border-line dark-flip-border last:border-0 hover:bg-sand/40 transition-colors ${i % 2 === 0 ? '' : 'bg-sand/20'}`}>

                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-display font-semibold text-[13px] text-charcoal dark-flip-text leading-snug">
                          {a.name}
                        </p>
                        {a.type?.[0] && (
                          <p className="font-mono text-[9px] text-charcoal/30 dark-flip-muted mt-0.5 truncate max-w-[200px]">{a.type[0]}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-sans text-[12px] text-charcoal/60 dark-flip-muted">{a.country?.name ?? '—'}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={a.contentStatus} />
                    </td>

                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="font-mono text-[10px] text-charcoal/35 dark-flip-muted">
                        {a.lastVerifiedDate ?? '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {loading === a._id ? (
                          <svg className="w-4 h-4 animate-spin text-charcoal/30" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <>
                            {/* Contributor action: Draft or Incomplete → submit for review */}
                            {(a.contentStatus === 'Draft' || a.contentStatus === 'Incomplete') && (
                              <button onClick={() => changeStatus(a._id, 'Verified')}
                                className="font-mono text-[9px] uppercase tracking-[0.1em] text-moss-700 hover:text-moss-600 border border-moss-200 hover:border-moss-400 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap">
                                Submit
                              </button>
                            )}

                            {/* Admin only actions */}
                            {role === 'admin' && a.contentStatus === 'Verified' && (
                              <>
                                <button onClick={() => changeStatus(a._id, 'Published')}
                                  className="font-mono text-[9px] uppercase tracking-[0.1em] text-gold-700 hover:text-gold-600 border border-gold-200 hover:border-gold-400 px-2.5 py-1 rounded-lg transition-all">
                                  Publish
                                </button>
                                <button onClick={() => changeStatus(a._id, 'Draft')}
                                  className="font-mono text-[9px] uppercase tracking-[0.1em] text-charcoal/40 hover:text-charcoal/70 border border-line hover:border-charcoal/30 px-2.5 py-1 rounded-lg transition-all">
                                  Return
                                </button>
                              </>
                            )}

                            {role === 'admin' && a.contentStatus === 'Published' && (
                              <button onClick={() => changeStatus(a._id, 'Needs Update')}
                                className="font-mono text-[9px] uppercase tracking-[0.1em] text-crimson/70 hover:text-crimson border border-crimson/20 hover:border-crimson/40 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap">
                                Flag
                              </button>
                            )}

                            {role === 'admin' && a.contentStatus === 'Needs Update' && (
                              <button onClick={() => changeStatus(a._id, 'Published')}
                                className="font-mono text-[9px] uppercase tracking-[0.1em] text-gold-700 hover:text-gold-600 border border-gold-200 hover:border-gold-400 px-2.5 py-1 rounded-lg transition-all">
                                Re-publish
                              </button>
                            )}
                          </>
                        )}

                        {/* Sanity Studio link */}
                        <Link href={`/studio/structure/attraction;${a._id}`}
                          target="_blank"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-line dark-flip-border text-charcoal/30 hover:text-crimson hover:border-crimson/40 transition-all"
                          title="Edit in Studio">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 200 && (
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/30 dark-flip-muted text-center">
          Showing 200 of {filtered.length} results. Refine the filter or search to narrow results.
        </p>
      )}
    </div>
  )
}
