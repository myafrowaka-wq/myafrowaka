import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/writeClient'

// Session 5.2 — "correct tracking... and click counting." Every affiliate
// link on the site points here first, never straight at the partner URL —
// this is what makes the click count real rather than a number nobody
// actually measures. increment happens server-side, only on a genuine
// outbound click through this route; nothing else touches clickCount.
//
// A missing or inactive slug redirects home rather than 404ing or showing
// an error page — a stale/typo'd affiliate link shouldn't dead-end a
// visitor who followed it in good faith.

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const origin = new URL(req.url).origin

  const link = await writeClient.fetch<{ _id: string; url: string; active?: boolean } | null>(
    `*[_type == "affiliateLink" && slug.current == $slug][0]{ _id, url, active }`,
    { slug }
  ).catch(() => null)

  if (!link || link.active === false) {
    return NextResponse.redirect(origin, { status: 302 })
  }

  // Fire-and-forget-ish, but awaited: a failed click count shouldn't be
  // silent, and this redirect is fast enough that waiting on one small
  // patch doesn't meaningfully slow the visitor down. If it fails, the
  // redirect still happens — a lost click count is not a reason to strand
  // someone on a broken link.
  await writeClient.patch(link._id).inc({ clickCount: 1 }).commit().catch(err => {
    console.error(`[Affiliate] Failed to increment click count for ${slug}:`, err)
  })

  return NextResponse.redirect(link.url, { status: 302 })
}
