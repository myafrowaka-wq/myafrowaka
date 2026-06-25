'use client'
import { useState, useEffect, useMemo } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttractionSEO {
  _id: string
  name: string
  slug: string
  contentStatus: string
  continentRegion?: string
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  lastVerifiedDate?: string
  hasBody: boolean
  country?: { name: string }
}

type Check = 'ok' | 'warn' | 'fail'

interface Health {
  title:       Check
  description: Check
  keyword:     Check
  body:        Check
  verified:    Check
  score:       number
}

// ── Status badge colours ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  Published:    'text-moss-400 border-moss-400/25 bg-moss-400/8',
  Verified:     'text-gold-400 border-gold-400/25 bg-gold-400/8',
  Draft:        'text-cream/30 border-white/10 bg-white/3',
  Incomplete:   'text-ochre-400 border-ochre-400/25 bg-ochre-400/8',
  'Needs Update': 'text-crimson border-crimson/25 bg-crimson/8',
  Archived:     'text-cream/20 border-white/6 bg-white/2',
}

// ── Health computation ────────────────────────────────────────────────────────

function computeHealth(a: AttractionSEO): Health {
  const titleLen = (a.metaTitle ?? '').length
  const descLen  = (a.metaDescription ?? '').length

  const title:       Check = !a.metaTitle       ? 'fail' : titleLen > 65  ? 'warn' : 'ok'
  const description: Check = !a.metaDescription ? 'fail' : descLen  > 160 ? 'warn' : 'ok'
  const keyword:     Check = a.focusKeyword ? 'ok' : 'fail'
  const body:        Check = a.hasBody      ? 'ok' : 'fail'
  const verified:    Check = a.lastVerifiedDate ? 'ok' : 'fail'

  const score = [title, description, keyword, body, verified].filter(c => c === 'ok').length

  return { title, description, keyword, body, verified, score }
}

// ── Check dot ─────────────────────────────────────────────────────────────────

function Dot({ check, label }: { check: Check; label: string }) {
  const color = check === 'ok' ? 'bg-moss-400' : check === 'warn' ? 'bg-gold-400' : 'bg-crimson'
  const title = check === 'ok' ? `${label}: OK` : check === 'warn' ? `${label}: Warning` : `${label}: Missing`
  return (
    <span title={title} className={`inline-block w-2 h-2 rounded-full shrink-0 ${color}`}/>
  )
}

// ── Status filter tabs ────────────────────────────────────────────────────────

const STATUS_TABS = ['All', 'Published', 'Verified', 'Draft', 'Incomplete', 'Needs Update', 'Archived']

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSeoPage() {
  const [data,      setData]      = useState<AttractionSEO[]>([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('All')
  const [search,    setSearch]    = useState('')
  const [sortBy,    setSortBy]    = useState<'score' | 'name' | 'status'>('score')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'ready' | 'partial' | 'needs'>('all')

  useEffect(() => {
    fetch('/api/admin/seo')
      .then(r => r.json())
      .then(d => { setData(d.attractions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const withHealth = useMemo(() => data.map(a => ({ ...a, health: computeHealth(a) })), [data])

  const summary = useMemo(() => ({
    total:   withHealth.length,
    ready:   withHealth.filter(a => a.health.score === 5).length,
    partial: withHealth.filter(a => a.health.score >= 3 && a.health.score < 5).length,
    needs:   withHealth.filter(a => a.health.score < 3).length,
    published: withHealth.filter(a => a.contentStatus === 'Published').length,
  }), [withHealth])

  const filtered = useMemo(() => {
    let rows = withHealth
    if (tab !== 'All')      rows = rows.filter(a => a.contentStatus === tab)
    if (search.trim())      rows = rows.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.country?.name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    if (scoreFilter === 'ready')   rows = rows.filter(a => a.health.score === 5)
    if (scoreFilter === 'partial') rows = rows.filter(a => a.health.score >= 3 && a.health.score < 5)
    if (scoreFilter === 'needs')   rows = rows.filter(a => a.health.score < 3)

    if (sortBy === 'score')  rows = [...rows].sort((a, b) => a.health.score - b.health.score)
    if (sortBy === 'name')   rows = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'status') rows = [...rows].sort((a, b) => a.contentStatus.localeCompare(b.contentStatus))

    return rows.slice(0, 250)
  }, [withHealth, tab, search, scoreFilter, sortBy])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: withHealth.length }
    STATUS_TABS.slice(1).forEach(s => { counts[s] = withHealth.filter(a => a.contentStatus === s).length })
    return counts
  }, [withHealth])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400/60 mb-1">Admin</p>
        <h1 className="font-display font-extrabold text-cream"
          style={{ fontSize: 'clamp(20px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          SEO Audit
        </h1>
        <p className="font-sans text-[13px] text-cream/40 mt-1">
          Check every attraction for publish-readiness before going live.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total',     value: summary.total,     color: 'text-cream/60'  },
            { label: 'Published', value: summary.published,  color: 'text-moss-400'  },
            { label: 'SEO Ready', value: summary.ready,      color: 'text-gold-400'  },
            { label: 'Partial',   value: summary.partial,    color: 'text-ochre-400' },
            { label: 'Needs Work',value: summary.needs,      color: 'text-crimson'   },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <p className={`font-display font-extrabold text-2xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/30">Checks:</p>
        {[
          { label: 'Meta Title (≤65)',     color: 'text-cream/50' },
          { label: 'Meta Description (≤160)', color: 'text-cream/50' },
          { label: 'Focus Keyword',        color: 'text-cream/50' },
          { label: 'Article Body',         color: 'text-cream/50' },
          { label: 'Verified Date',        color: 'text-cream/50' },
        ].map(l => <span key={l.label} className="font-mono text-[8px] text-cream/40">{l.label}</span>)}
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-moss-400"/><span className="font-mono text-[8px] text-cream/35">OK</span></span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-gold-400"/><span className="font-mono text-[8px] text-cream/35">Too long</span></span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-crimson"/><span className="font-mono text-[8px] text-cream/35">Missing</span></span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={`font-mono text-[8px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-all ${
                tab === s
                  ? 'bg-gold-400 text-ink border-gold-400'
                  : 'text-cream/40 border-white/12 hover:text-cream/70 hover:border-white/25'
              }`}>
              {s} {tabCounts[s] > 0 && <span className="ml-1 opacity-60">{tabCounts[s]}</span>}
            </button>
          ))}
        </div>

        {/* Search + sort + score filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search name or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/6 border border-white/12 rounded-xl px-3 py-2 font-sans text-[12px] text-cream placeholder-cream/25 focus:outline-none focus:border-gold-400/40 w-52"
          />
          <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value as typeof scoreFilter)}
            className="bg-white/6 border border-white/12 rounded-xl px-3 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-cream/50 focus:outline-none">
            <option value="all">All scores</option>
            <option value="ready">SEO Ready (5/5)</option>
            <option value="partial">Partial (3-4)</option>
            <option value="needs">Needs work (0-2)</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white/6 border border-white/12 rounded-xl px-3 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-cream/50 focus:outline-none">
            <option value="score">Sort: Score (worst first)</option>
            <option value="name">Sort: Name A-Z</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin text-cream/25" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-cream/30">No attractions match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-5 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25">Attraction</th>
                  <th className="text-left px-4 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden md:table-cell">Status</th>
                  <th className="text-center px-4 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25">Score</th>
                  <th className="text-center px-3 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden sm:table-cell">Title</th>
                  <th className="text-center px-3 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden sm:table-cell">Desc</th>
                  <th className="text-center px-3 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden lg:table-cell">KW</th>
                  <th className="text-center px-3 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden lg:table-cell">Body</th>
                  <th className="text-center px-3 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25 hidden lg:table-cell">Date</th>
                  <th className="text-right px-5 py-3.5 font-mono text-[7px] uppercase tracking-[0.16em] text-cream/25">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const h = a.health
                  const scoreColor = h.score === 5 ? 'text-moss-400' : h.score >= 3 ? 'text-gold-400' : 'text-crimson'
                  return (
                    <tr key={a._id} className="border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-sans text-[12px] text-cream/75 leading-snug">{a.name}</p>
                        {a.country && (
                          <p className="font-mono text-[8px] text-cream/25 mt-0.5 uppercase tracking-[0.1em]">{a.country.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className={`font-mono text-[7px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${STATUS_STYLE[a.contentStatus] ?? 'text-cream/30 border-white/10'}`}>
                          {a.contentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono font-bold text-[13px] ${scoreColor}`}>{h.score}/5</span>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden sm:table-cell">
                        <Dot check={h.title} label="Meta Title"/>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden sm:table-cell">
                        <Dot check={h.description} label="Meta Description"/>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                        <Dot check={h.keyword} label="Focus Keyword"/>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                        <Dot check={h.body} label="Article Body"/>
                      </td>
                      <td className="px-3 py-3.5 text-center hidden lg:table-cell">
                        <Dot check={h.verified} label="Last Verified Date"/>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <a href={`/studio/structure/attraction;${a._id}`} target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[8px] uppercase tracking-[0.1em] text-gold-400/60 hover:text-gold-400 border border-gold-400/20 hover:border-gold-400/40 px-2.5 py-1 rounded-lg transition-all inline-block">
                          Edit
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 250 && (
              <div className="px-5 py-3 border-t border-white/6 text-center">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-cream/20">Showing first 250 results. Use filters to narrow down.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
