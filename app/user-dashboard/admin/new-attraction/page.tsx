import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { AdminNewAttractionForm } from '@/components/AdminNewAttractionForm'

export const metadata: Metadata = {
  title: 'Add Attraction – MyAfroWaka Admin',
  robots: { index: false, follow: false },
}

export default async function NewAttractionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'admin') redirect('/user-dashboard')

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark-flip-muted">
          <Link href="/user-dashboard" className="hover:text-charcoal/60 dark-flip-text transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-charcoal/60 dark-flip-text">Add Attraction</span>
        </div>

        <div className="mb-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-crimson mb-3">Admin</p>
          <h1 className="font-display font-extrabold text-charcoal dark-flip-text"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.025em', lineHeight: '1.05' }}>
            Add New Attraction
          </h1>
          <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted mt-2 leading-relaxed">
            Create the attraction record here. After saving, open Sanity Studio to add the full article body, coordinates, quick facts, and images. Set Content Status to Published to make it visible on the site.
          </p>
        </div>

        <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-3xl p-8">
          <AdminNewAttractionForm />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <a href="/studio" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted hover:text-charcoal/60 dark-flip-text transition-colors">
            Open Sanity Studio
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
          <Link href="/user-dashboard/admin/new-post"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted hover:text-charcoal/60 dark-flip-text transition-colors">
            Write article instead
          </Link>
        </div>
      </div>
    </div>
  )
}
