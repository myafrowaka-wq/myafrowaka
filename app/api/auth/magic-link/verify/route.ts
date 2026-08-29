import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'
import { safeRedirect } from '@/lib/safeRedirect'
import { routing } from '@/i18n/routing'

// Session 5.3 look-through — this Route Handler sits outside app/[locale],
// so there's no request-scoped locale context to read (next-intl's
// middleware doesn't even run on /api). The login page now re-stamps
// `next` with the active locale before it's ever emailed (see
// app/[locale]/login/page.tsx), so by the time it comes back here it's
// already locale-prefixed for fr/pt (e.g. /fr/user-dashboard) — this just
// reads that same prefix back off it so the two error-redirects below land
// on the login page in the same language the visitor was signing in with,
// instead of always bouncing to the English one.
function loginPathForLocale(path: string): string {
  const seg = path.split('/')[1]
  const locales: readonly string[] = routing.locales
  return locales.includes(seg) && seg !== routing.defaultLocale ? `/${seg}/login` : '/login'
}

// Session 4.1 — where a clicked magic-link email actually lands. This has
// to be a Route Handler, not logic inside app/login/page.tsx's render: a
// Server Component render can't set response cookies, so calling signIn()
// there validates the token (a real side effect, via consumeMagicLinkToken)
// but the resulting session cookie never reaches the browser — found by
// testing this live and seeing the token get marked used while the session
// stayed null. A Route Handler can set cookies, same as a Server Action.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''
  const redirectTo = safeRedirect(searchParams.get('next'), '/user-dashboard')

  if (!email || !token) {
    return NextResponse.redirect(new URL(`${loginPathForLocale(redirectTo)}?error=CredentialsSignin`, req.url))
  }

  try {
    return await signIn('credentials', {
      email,
      magicToken: token,
      redirectTo,
      redirect: true,
    })
  } catch (err: unknown) {
    // signIn() with redirect:true throws NEXT_REDIRECT on success — let it
    // propagate. Anything else (expired/used/invalid token) means the
    // Credentials provider's authorize() returned null.
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('NEXT_REDIRECT')) throw err
    return NextResponse.redirect(new URL(`${loginPathForLocale(redirectTo)}?error=CredentialsSignin`, req.url))
  }
}
