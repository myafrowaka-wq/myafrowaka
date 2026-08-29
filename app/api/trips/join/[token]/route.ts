import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { acceptTripInvite } from '@/lib/tripInvite'

// POST — the signed-in visitor actually joins the trip. Session 4.1's
// "joining requires an account" — the public preview page
// (app/trips/join/[token]/page.tsx) is viewable signed out, but this is
// the step that needs a real session, same auth-wall shape as the trip
// planner's "Save this trip".
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await params
  const result = await acceptTripInvite(token, {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? session.user.email ?? 'Traveler',
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, tripId: result.tripId })
}
