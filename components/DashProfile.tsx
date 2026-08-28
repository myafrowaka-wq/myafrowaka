'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface Props {
  initialName: string
  email: string
  role: string
  initials: string
}

const ROLE_LABELS: Record<string, string> = {
  subscriber:      'Subscriber',
  moderator:       'Moderator',
  contributor:     'Contributor',
  'author-editor': 'Author / Editor',
  admin:           'Administrator',
  visitor:         'Visitor',
}

export function DashProfile({ initialName, email, role, initials }: Props) {
  const { update }   = useSession()
  const [name, setName]   = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      await update({ name: name.trim() })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError('Could not save. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">

      {/* Avatar + account info */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-6">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-charcoal/55 dark-flip-muted mb-5">Account</p>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson/80 to-ochre/70 flex items-center justify-center shrink-0">
            <span className="font-display font-extrabold text-2xl text-cream/90">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] truncate"
              style={{ letterSpacing: '-0.01em' }}>
              {name || 'User'}
            </p>
            <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted truncate">{email}</p>
          </div>
        </div>

        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted">Role</dt>
            <dd>
              <span className="font-sans text-[14px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-charcoal/8 dark-flip-surf text-charcoal/65 dark-flip-muted">
                {ROLE_LABELS[role] ?? role}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted">Email</dt>
            <dd className="font-sans text-[14px] text-charcoal/65 dark-flip-muted truncate max-w-[160px]">{email}</dd>
          </div>
        </dl>
      </div>

      {/* Edit display name */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-6">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-charcoal/55 dark-flip-muted mb-5">Edit Profile</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="display-name"
              className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={80}
              placeholder="Your display name"
              className="w-full border border-line dark-flip-border bg-white dark-flip-surf text-charcoal dark-flip-text placeholder-charcoal/30 dark:placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {error && (
            <p className="font-sans text-[14px] text-crimson">{error}</p>
          )}

          {success && (
            <p className="font-sans text-[14px] text-forest dark:text-moss">Name updated successfully.</p>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim() || name.trim() === initialName}
            className="w-full bg-ink hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed text-cream font-sans text-[14px] uppercase tracking-[0.14em] py-3 rounded-xl transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-line dark-flip-border">
          <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/50 dark-flip-muted mb-2">Password</p>
          <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed">
            Password changes are managed through your sign-in provider. Sign out and use the reset option on the login page.
          </p>
        </div>
      </div>
    </div>
  )
}
