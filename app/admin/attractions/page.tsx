import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from 'next-sanity'
import { PipelineBoard } from '@/components/PipelineBoard'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

export default async function AdminAttractionsPage() {
  const session = await auth()
  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'contributor')) {
    redirect('/')
  }

  const attractions = await readClient.fetch(`
    *[_type == "attraction"] | order(contentStatus asc, name asc) [0..499] {
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
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400/60 mb-1">Admin</p>
        <h1 className="font-display font-extrabold text-cream"
          style={{ fontSize: 'clamp(20px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          Attraction Pipeline
        </h1>
        <p className="font-sans text-[13px] text-cream/40 mt-1">
          {session.user?.role === 'admin'
            ? 'Review, publish, and manage all attractions.'
            : 'Submit your draft attractions for editorial review.'}
        </p>
      </div>

      <PipelineBoard attractions={attractions} role={session.user?.role ?? 'visitor'} />
    </div>
  )
}
