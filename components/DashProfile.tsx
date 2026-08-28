'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface CountryOption {
  _id: string
  name: string
  slug: string
  countryCode?: string
}

interface Props {
  initialName: string
  email: string
  role: string
  initials: string
  photoUrl: string | null
  initialHomeCountry: string
  initialTravelStyle: string
  initialCountriesVisited: string[]
  initialLanguages: string[]
  allCountries: CountryOption[]
}

const ROLE_LABELS: Record<string, string> = {
  subscriber:      'Subscriber',
  moderator:       'Moderator',
  contributor:     'Contributor',
  'author-editor': 'Editor',
  admin:           'Admin',
  visitor:         'Visitor',
}

const TRAVEL_STYLES = [
  'Solo Travelers', 'Couples', 'Families', 'Backpackers',
  'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
]

export function DashProfile({
  initialName, email, role, initials, photoUrl,
  initialHomeCountry, initialTravelStyle, initialCountriesVisited, initialLanguages, allCountries,
}: Props) {
  const { update } = useSession()
  const [name, setName]     = useState(initialName)
  const [homeCountry, setHomeCountry]         = useState(initialHomeCountry)
  const [travelStyle, setTravelStyle]         = useState(initialTravelStyle)
  const [countriesVisited, setCountriesVisited] = useState<string[]>(initialCountriesVisited)
  const [languages, setLanguages]             = useState<string[]>(initialLanguages)
  const [languageInput, setLanguageInput]     = useState('')

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl)
  const [uploadingPhoto, setUploadingPhoto]   = useState(false)
  const [photoError, setPhotoError]           = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  // The "saved" baseline for the dirty check. Starts as the server-rendered
  // props, but a successful save moves it forward — otherwise isDirty would
  // keep comparing against the original page-load values forever, leaving
  // Save Changes permanently enabled even right after saving successfully.
  const [savedBaseline, setSavedBaseline] = useState({
    name: initialName,
    homeCountry: initialHomeCountry,
    travelStyle: initialTravelStyle,
    countriesVisited: initialCountriesVisited,
    languages: initialLanguages,
  })

  const isDirty = name.trim() !== savedBaseline.name
    || homeCountry !== savedBaseline.homeCountry
    || travelStyle !== savedBaseline.travelStyle
    || languages.join(',') !== savedBaseline.languages.join(',')
    || countriesVisited.slice().sort().join(',') !== savedBaseline.countriesVisited.slice().sort().join(',')

  function toggleCountryVisited(id: string) {
    setCountriesVisited(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function addLanguage() {
    const v = languageInput.trim()
    if (v && !languages.includes(v)) setLanguages(prev => [...prev, v])
    setLanguageInput('')
  }

  function removeLanguage(lang: string) {
    setLanguages(prev => prev.filter(l => l !== lang))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/user/profile/photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setCurrentPhotoUrl(prev => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    }
    setUploadingPhoto(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
        body: JSON.stringify({
          name: name.trim(),
          homeCountryId: homeCountry || null,
          travelStyle: travelStyle || null,
          countriesVisitedIds: countriesVisited,
          languages,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      if (name.trim() !== savedBaseline.name) await update({ name: name.trim() })
      setSavedBaseline({
        name: name.trim(),
        homeCountry,
        travelStyle,
        countriesVisited,
        languages,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError('Could not save. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Avatar + account info */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-6">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-charcoal/55 dark-flip-muted mb-5">Account</p>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-crimson/80 to-ochre/70 flex items-center justify-center">
            {currentPhotoUrl ? (
              <Image src={currentPhotoUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <span className="font-display font-extrabold text-2xl text-cream/90">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] truncate"
              style={{ letterSpacing: '-0.01em' }}>
              {name || 'User'}
            </p>
            <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted truncate mb-2">{email}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson hover:text-crimson/70 disabled:opacity-50 transition-colors">
              {uploadingPhoto ? 'Uploading...' : 'Change photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            {photoError && <p className="font-sans text-[14px] text-crimson mt-1">{photoError}</p>}
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
        </dl>

        <div className="mt-6 pt-5 border-t border-line dark-flip-border">
          <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/50 dark-flip-muted mb-2">Password</p>
          <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed">
            Password changes are managed through your sign-in provider. Sign out and use the reset option on the login page.
          </p>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl p-6">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-charcoal/55 dark-flip-muted mb-5">Edit Profile</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="display-name"
              className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Display Name
            </label>
            <input
              id="display-name" type="text" value={name} onChange={e => setName(e.target.value)}
              maxLength={80} placeholder="Your display name"
              className="w-full border border-line dark-flip-border bg-white dark-flip-surf text-charcoal dark-flip-text placeholder-charcoal/30 dark:placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="home-country"
              className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Home Country
            </label>
            <select id="home-country" value={homeCountry} onChange={e => setHomeCountry(e.target.value)}
              className="w-full border border-line dark-flip-border bg-white dark-flip-surf text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors">
              <option value="">Not set</option>
              {allCountries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted mt-1.5">Lets us personalise what you see on the homepage.</p>
          </div>

          <div>
            <label htmlFor="travel-style"
              className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Travel Style
            </label>
            <select id="travel-style" value={travelStyle} onChange={e => setTravelStyle(e.target.value)}
              className="w-full border border-line dark-flip-border bg-white dark-flip-surf text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors">
              <option value="">Not set</option>
              {TRAVEL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-2">Languages Spoken</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {languages.map(lang => (
                <span key={lang} className="inline-flex items-center gap-1.5 font-sans text-[14px] text-charcoal/70 dark-flip-muted bg-sand dark-flip-surf border border-line dark-flip-border px-2.5 py-1 rounded-full">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(lang)} aria-label={`Remove ${lang}`} className="text-charcoal/40 hover:text-crimson transition-colors">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={languageInput} onChange={e => setLanguageInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                placeholder="e.g. English, Yoruba..."
                className="flex-1 border border-line dark-flip-border bg-white dark-flip-surf text-charcoal dark-flip-text placeholder-charcoal/30 dark:placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button type="button" onClick={addLanguage}
                className="border border-line dark-flip-border rounded-xl px-4 font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/60 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors">
                Add
              </button>
            </div>
          </div>

          <div>
            <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-2">
              Countries Visited <span className="font-normal text-charcoal/40 dark-flip-muted">({countriesVisited.length})</span>
            </p>
            <div className="max-h-40 overflow-y-auto border border-line dark-flip-border rounded-xl p-3 space-y-1">
              {allCountries.map(c => (
                <label key={c._id} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
                  <input type="checkbox" checked={countriesVisited.includes(c._id)} onChange={() => toggleCountryVisited(c._id)}
                    className="w-4 h-4 rounded border-line accent-crimson cursor-pointer" />
                  <span className="font-sans text-sm text-charcoal/70 dark-flip-muted group-hover:text-crimson transition-colors">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="font-sans text-[14px] text-crimson">{error}</p>}
          {success && <p className="font-sans text-[14px] text-moss-600 dark:text-moss-300">Profile updated successfully.</p>}

          <button
            type="submit"
            disabled={saving || !name.trim() || !isDirty}
            className="w-full bg-ink hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed text-cream font-sans text-[14px] uppercase tracking-[0.14em] py-3 rounded-xl transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
