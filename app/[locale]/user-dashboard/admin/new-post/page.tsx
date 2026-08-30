import { redirect } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { getLocale } from 'next-intl/server'
import { atLeast } from '@/lib/roles'
import type { UserRole } from '@/types/next-auth'
import { AdminNewPostForm } from '@/components/AdminNewPostForm'

export const metadata: Metadata = {
  title: { absolute: 'New Article – MyAfroWaka Admin' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  robots: { index: false, follow: false },
}

export default async function NewPostPage() {
  const session = await auth()
  const locale = await getLocale()
  if (!session?.user) redirect({ href: '/login', locale })
  // Author-Editor and up — see lib/roles.ts and app/api/admin/create-post/route.ts.
  if (!atLeast((session!.user.role ?? 'visitor') as UserRole, 'author-editor')) redirect({ href: '/user-dashboard', locale })

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/65 dark-flip-muted">
          <Link href="/user-dashboard" className="hover:text-charcoal/60 dark-flip-text transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-charcoal/60 dark-flip-text">New Article</span>
        </div>

        <div className="mb-8">
          <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">Admin</p>
          <h1 className="font-display font-extrabold text-charcoal dark-flip-text"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.025em', lineHeight: '1.05' }}>
            New Blog Article
          </h1>
          <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted mt-2 leading-relaxed">
            Fill in the fields below and save. The article will appear in Sanity as a Draft. Open Sanity Studio to add images, rich formatting, and publish it.
          </p>
        </div>

        <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-3xl p-8">
          <AdminNewPostForm />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <a href="/studio" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark-flip-muted hover:text-charcoal/60 dark-flip-text transition-colors">
            Open Sanity Studio
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
          <Link href="/user-dashboard/admin/new-attraction"
            className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark-flip-muted hover:text-charcoal/60 dark-flip-text transition-colors">
            Add Attraction instead
          </Link>
        </div>
      </div>
    </div>
  )
}
