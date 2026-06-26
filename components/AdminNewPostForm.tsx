'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Destinations', 'Culture & Heritage', 'Travel Planning', 'Food Tourism', 'Experiences']

type Status = 'idle' | 'loading' | 'success' | 'error'

export function AdminNewPostForm() {
  const [status, setStatus]   = useState<Status>('idle')
  const [errMsg, setErrMsg]   = useState('')
  const [slug, setSlug]       = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    const form = e.currentTarget
    const data = {
      title:         (form.elements.namedItem('title')         as HTMLInputElement).value.trim(),
      excerpt:       (form.elements.namedItem('excerpt')       as HTMLTextAreaElement).value.trim(),
      category:      (form.elements.namedItem('category')      as HTMLSelectElement).value,
      contentStatus: (form.elements.namedItem('contentStatus') as HTMLSelectElement).value,
      bodyText:      (form.elements.namedItem('bodyText')      as HTMLTextAreaElement).value.trim(),
    }

    try {
      const res  = await fetch('/api/admin/create-post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus('success')
        setSlug(json.slug ?? '')
      } else {
        setStatus('error')
        setErrMsg(json.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setErrMsg('Network error. Check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-moss/8 border border-moss/20 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-moss/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="font-display font-bold text-charcoal dark-flip-text mb-2" style={{ fontSize: '20px', letterSpacing: '-0.015em' }}>
          Post created in Sanity.
        </h2>
        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mb-5">
          It was saved as a Draft. Open Sanity Studio to add images, edit content, and set status to Published.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/studio" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-ink hover:bg-charcoal text-cream font-display font-bold text-[11px] uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all">
            Open Sanity Studio
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
          <Link href={`/blog/${slug}`}
            className="inline-flex items-center gap-2 border border-line dark-flip-border hover:border-crimson text-charcoal dark-flip-text hover:text-crimson font-display font-bold text-[11px] uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all">
            Preview Article
          </Link>
          <button onClick={() => { setStatus('idle'); setSlug('') }}
            className="font-sans text-[13px] text-charcoal/45 dark-flip-muted hover:text-charcoal/70 transition-colors">
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {errMsg && (
        <div className="bg-crimson/8 border border-crimson/25 rounded-xl px-4 py-3">
          <p className="font-sans text-[13px] text-crimson">{errMsg}</p>
        </div>
      )}

      <div>
        <label className="font-display font-semibold text-[12px] uppercase tracking-[0.1em] text-charcoal/50 dark-flip-muted block mb-2">Title *</label>
        <input name="title" required placeholder="The Complete Guide to Victoria Falls"
          className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors"/>
      </div>

      <div>
        <label className="font-display font-semibold text-[12px] uppercase tracking-[0.1em] text-charcoal/50 dark-flip-muted block mb-2">Excerpt (shown in article listing)</label>
        <textarea name="excerpt" rows={3} placeholder="One or two sentences. Max 280 characters."
          className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 resize-none transition-colors"/>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="font-display font-semibold text-[12px] uppercase tracking-[0.1em] text-charcoal/50 dark-flip-muted block mb-2">Category</label>
          <div className="relative">
            <select name="category"
              className="w-full appearance-none border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text focus:outline-none focus:border-gold-400 transition-colors pr-10">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
        <div>
          <label className="font-display font-semibold text-[12px] uppercase tracking-[0.1em] text-charcoal/50 dark-flip-muted block mb-2">Status</label>
          <div className="relative">
            <select name="contentStatus"
              className="w-full appearance-none border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text focus:outline-none focus:border-gold-400 transition-colors pr-10">
              <option value="Draft">Draft (not visible to public)</option>
              <option value="Published">Published (live on /blog)</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <div>
        <label className="font-display font-semibold text-[12px] uppercase tracking-[0.1em] text-charcoal/50 dark-flip-muted block mb-2">
          Article Body
          <span className="font-sans text-[10px] normal-case tracking-normal text-charcoal/35 dark-flip-muted ml-2">Separate paragraphs with a blank line. You can add rich formatting later in Sanity Studio.</span>
        </label>
        <textarea name="bodyText" rows={14} placeholder={"Write your first paragraph here.\n\nLeave a blank line between each paragraph.\n\nYou can add images, headings, and links later in Sanity Studio."}
          className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 resize-y transition-colors leading-relaxed"/>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={status === 'loading'}
          className="inline-flex items-center gap-2.5 bg-crimson hover:bg-crimson-600 disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[11px] uppercase tracking-[0.12em] px-8 py-3.5 rounded-full transition-all shadow-[0_4px_20px_rgba(162,46,41,0.22)]">
          {status === 'loading' ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving to Sanity…
            </>
          ) : (
            <>
              Save Article
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </>
          )}
        </button>
        <p className="font-sans text-[11px] text-charcoal/30 dark-flip-muted">Saved as Draft by default. Publish from Sanity Studio.</p>
      </div>
    </form>
  )
}
