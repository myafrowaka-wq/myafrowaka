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

// PATCH — update display name (stored in Sanity userRole document)
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json() as { name?: string }
  const trimmed = (name ?? '').trim()
  if (!trimmed || trimmed.length > 80) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  const doc = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "userRole" && userId == $uid][0]{ _id }`,
    { uid: session.user.id }
  )

  if (doc) {
    await writeClient.patch(doc._id).set({ userName: trimmed }).commit()
  }

  return NextResponse.json({ ok: true, name: trimmed })
}
