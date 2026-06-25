import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'

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

  const VALID_ROLES = ['visitor', 'contributor', 'admin']
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await writeClient.patch(id).set({ role }).commit()
  return NextResponse.json({ ok: true })
}
