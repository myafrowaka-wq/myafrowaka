'use client'
import { useState, useEffect } from 'react'
import type { UserRole } from '@/types/next-auth'
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ASSIGNABLE_ROLES } from '@/lib/roles'

// Session 4.1 — "build out the five roles properly with real permissions."
// This page previously only let an admin assign 3 of the 6 role values the
// rest of the app already checks against (VALID_ROLES on the API side was
// ['visitor', 'contributor', 'admin']) — Moderator and Editor existed in
// every atLeast() permission check throughout the dashboard but could never
// actually be granted to a real user through any UI. Now covers all 5 real,
// assignable roles.

interface UserDoc {
  _id: string
  userId: string
  userEmail: string
  userName: string
  role: UserRole
  createdAt: string
}

const ROLE_STYLE: Record<UserRole, string> = {
  admin:           'text-gold-400 border-gold-400/25 bg-gold-400/8',
  'author-editor': 'text-crimson-300 border-crimson-300/25 bg-crimson-300/8',
  moderator:       'text-ochre-300 border-ochre-300/25 bg-ochre-300/8',
  contributor:     'text-moss-400 border-moss-400/25 bg-moss-400/8',
  subscriber:      'text-cream/50 border-white/15 bg-white/5',
  visitor:         'text-cream/30 border-white/10 bg-white/3',
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function changeRole(id: string, role: UserRole) {
    setSaving(id)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    if (res.ok) setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
    setSaving(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400/60 mb-1">Admin</p>
        <h1 className="font-display font-extrabold text-cream"
          style={{ fontSize: 'clamp(20px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          User Management
        </h1>
        <p className="font-sans text-[14px] text-cream/40 mt-1">
          Assign roles to subscribers, contributors, moderators, editors, and admins.
        </p>
      </div>

      {/* Role guide — all 5 real, assignable roles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ASSIGNABLE_ROLES.map(role => (
          <div key={role} className="bg-white/5 border border-white/8 rounded-xl p-4">
            <span className={`inline-block font-sans text-[14px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border mb-2 ${ROLE_STYLE[role]}`}>
              {ROLE_LABELS[role]}
            </span>
            <p className="font-sans text-[14px] text-cream/40 leading-relaxed">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin text-cream/25" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm text-cream/30">No users yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-5 py-4 font-sans text-[14px] uppercase tracking-[0.14em] text-cream/25">User</th>
                  <th className="text-left px-4 py-4 font-sans text-[14px] uppercase tracking-[0.14em] text-cream/25 hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-4 font-sans text-[14px] uppercase tracking-[0.14em] text-cream/25">Role</th>
                  <th className="text-left px-5 py-4 font-sans text-[14px] uppercase tracking-[0.14em] text-cream/25">Change to</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-sans text-[14px] text-cream/70">{u.userName}</p>
                      <p className="font-sans text-[14px] text-cream/25 mt-0.5">{u.userEmail}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="font-sans text-[14px] text-cream/30">{formatDate(u.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block font-sans text-[14px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border ${ROLE_STYLE[u.role] ?? ROLE_STYLE.visitor}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center flex-wrap gap-1.5">
                        {saving === u._id ? (
                          <svg className="w-4 h-4 animate-spin text-cream/30" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          ASSIGNABLE_ROLES.filter(role => role !== u.role).map(role => (
                            <button key={role} onClick={() => changeRole(u._id, role)}
                              className={`font-sans text-[14px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg border transition-all hover:opacity-100 opacity-70 ${ROLE_STYLE[role]}`}>
                              {ROLE_LABELS[role]}
                            </button>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
