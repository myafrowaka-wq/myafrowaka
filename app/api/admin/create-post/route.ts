import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/sanity/lib/writeClient'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { title, excerpt, category, contentStatus, bodyText } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const bodyBlocks = (bodyText ?? '')
    .split('\n\n')
    .filter(Boolean)
    .map((para: string, i: number) => ({
      _key:  `para-${i}`,
      _type: 'block',
      style: 'normal',
      children: [{ _key: `span-${i}`, _type: 'span', text: para.trim(), marks: [] }],
      markDefs: [],
    }))

  try {
    const doc = await writeClient.create({
      _type:         'post',
      title:         title.trim(),
      slug:          { _type: 'slug', current: slug },
      excerpt:       excerpt?.trim() ?? '',
      category:      category ?? 'Destinations',
      contentStatus: contentStatus ?? 'Draft',
      publishedAt:   new Date().toISOString(),
      body:          bodyBlocks,
    })

    return NextResponse.json({ ok: true, id: doc._id, slug })
  } catch (err) {
    console.error('[Admin] create-post error:', err)
    return NextResponse.json({ error: 'Failed to create post in Sanity.' }, { status: 500 })
  }
}
