import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from 'next-sanity'

// Session 4.1 — profile photo upload. A browser can't hold the Sanity
// write token, so this route does the actual asset upload server-side: the
// client sends the raw file, this route uploads it to Sanity's asset
// pipeline and patches the signed-in user's own userRole document with the
// resulting image reference. No sourcedImage fields here (see
// userRole.ts's own comment) — a user's own photo of themselves doesn't
// need a photographer credit.

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPEG, PNG, or WebP image.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: `profile-${session.user.id}`,
      contentType: file.type,
    })

    const doc = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "userRole" && userId == $uid][0]{ _id }`,
      { uid: session.user.id }
    )
    if (doc) {
      await writeClient.patch(doc._id).set({
        photo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      }).commit()
    }

    return NextResponse.json({ ok: true, assetId: asset._id })
  } catch (err) {
    console.error('[Profile Photo Upload]', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
