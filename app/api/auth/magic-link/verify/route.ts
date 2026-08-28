import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'
import { safeRedirect } from '@/lib/safeRedirect'

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
    return NextResponse.redirect(new URL('/login?error=CredentialsSignin', req.url))
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
    return NextResponse.redirect(new URL('/login?error=CredentialsSignin', req.url))
  }
}
