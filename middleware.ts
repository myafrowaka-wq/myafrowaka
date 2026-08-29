import createMiddleware from 'next-intl/middleware'
import { auth } from '@/auth'
import { routing } from '@/i18n/routing'

// Session 5.3 — composes next-intl's locale-detection/redirect middleware
// with the existing NextAuth middleware, next-intl's own documented recipe
// for this pairing. The real "is this user allowed here" check still
// happens where it always has — each protected layout.tsx (admin,
// dashboard, user-dashboard) calls auth() itself and redirects — this
// middleware's auth() wrapper only ever attached req.auth to the request,
// it never redirected on its own (no `authorized` callback is defined in
// auth.ts), so wrapping intl's middleware with it preserves exactly that
// same minimal behavior rather than changing what enforces access.
const handleI18nRouting = createMiddleware(routing)

export default auth((req) => handleI18nRouting(req))

export const config = {
  // Every route except API handlers, the /go affiliate redirect (a route
  // handler outside [locale] with no locale-prefixed counterpart — letting
  // intl's middleware touch it would try to redirect a real outbound
  // affiliate click to a /fr/go/... 404), Next's internal assets, and
  // files with an extension (images, favicon, etc.). next-intl needs to
  // see every real page request to resolve/redirect locale, which is
  // broader than the old matcher (/dashboard, /user-dashboard, /admin
  // only) had to be when locale routing didn't exist yet.
  matcher: ['/((?!api|go|_next|_vercel|.*\\..*).*)'],
}
