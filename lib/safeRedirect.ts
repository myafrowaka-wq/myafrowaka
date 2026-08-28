// Session 4.2 — used everywhere a post-sign-in destination comes from a
// query param (?next=), so a visitor who hits the trip-planner's auth wall
// on "Save this trip" lands back on the trip they were building rather
// than the generic dashboard. Any string reaching here originated in a
// URL, so it's untrusted: only a same-site relative path is accepted,
// which rules out an open redirect via next=https://evil.example or the
// protocol-relative next=//evil.example.
export function safeRedirect(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback
  if (!next.startsWith('/') || next.startsWith('//')) return fallback
  if (next.includes('://')) return fallback
  return next
}
