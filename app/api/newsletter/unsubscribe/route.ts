import { NextResponse } from 'next/server'
import { unsubscribe } from '@/lib/newsletter'

// POST — the actual state change, fired only by an explicit button click on
// app/newsletter/unsubscribe/[token]/page.tsx. See lib/newsletter.ts's
// unsubscribe() for why this can never be a bare GET.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { token?: string } | null
  if (!body?.token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 })

  const result = await unsubscribe(body.token)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
