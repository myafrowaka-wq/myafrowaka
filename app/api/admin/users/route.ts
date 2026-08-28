import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'
import { ASSIGNABLE_ROLES } from '@/lib/roles'

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// GET — list all user role documents
export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await writeClient.fetch<{
    _id: string
    userId: string
    userEmail: string
    userName: string
    role: string
    createdAt: string
  }[]>(`
    *[_type == "userRole"] | order(createdAt desc) {
      _id, userId, userEmail, userName, role, createdAt
    }
  `)

  return NextResponse.json({ users })
}

// PATCH — update a user's role (admin only)
export async function PATCH(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, role } = await req.json() as { id: string; role: string }
  if (!id || !role) return NextResponse.json({ error: 'Missing id or role' }, { status: 400 })

  // All 5 real roles the plan names (Admin, Moderator, Editor/'author-editor',
  // Contributor, Subscriber) are assignable here — this used to allow only
  // ['visitor', 'contributor', 'admin'], which meant an admin could never
  // actually grant Moderator or Editor through this UI even though the rest
  // of the app (atLeast() checks throughout the dashboard) already expected
  // those roles to exist. 'visitor' is deliberately excluded: it's a legacy
  // value, not a role anyone should be actively assigned going forward.
  if (!(ASSIGNABLE_ROLES as string[]).includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await writeClient.patch(id).set({ role }).commit()
  return NextResponse.json({ ok: true })
}
