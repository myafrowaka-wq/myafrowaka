import { auth } from '@/auth'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { createClient } from 'next-sanity'
import { PipelineBoard } from '@/components/PipelineBoard'
import { atLeast } from '@/lib/roles'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export default async function AdminAttractionsPage() {
  const session = await auth()
  // Contributor and up: contributors submit drafts for review, author-editors
  // and admins review/publish. Moderator sits below contributor in the role
  // hierarchy and has no attraction-pipeline access.
  if (!session || !atLeast(session.user?.role ?? 'visitor', 'contributor')) {
    redirect({ href: '/', locale: await getLocale() })
  }

  // Session 6.2 — found live while testing the Editor persona: this used
  // to slice to [0..499], and PipelineBoard's status tabs filter that same
  // fetched array client-side rather than re-querying per tab. With 557
  // total attractions and ~509 of them Draft, sorting Draft-first meant the
  // capped 500 rows were ALL Draft — every other tab (Published, Verified,
  // Needs Update, Archived) silently showed "No attractions match this
  // filter" regardless of how many really existed, because none of them
  // were ever fetched at all. Removed the cap: 557 lightweight rows (no
  // article body) is a trivial fetch for an internal admin tool.
  const attractions = await readClient.fetch(`
    *[_type == "attraction"] | order(contentStatus asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      contentStatus,
      continentRegion,
      lastVerifiedDate,
      country->{ name },
      type
    }
  `)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400/70 mb-1">Admin</p>
        <h1 className="font-display font-extrabold text-cream"
          style={{ fontSize: 'clamp(20px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          Attraction Pipeline
        </h1>
        <p className="font-sans text-[14px] text-cream/55 mt-1">
          {atLeast(session!.user?.role ?? 'visitor', 'author-editor')
            ? 'Review, publish, and manage all attractions.'
            : 'Submit your draft attractions for editorial review.'}
        </p>
      </div>

      <PipelineBoard attractions={attractions} role={session!.user?.role ?? 'visitor'} />
    </div>
  )
}
