import Image from 'next/image'
import { Link, getPathname } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { signIn } from '@/auth'
import { getTranslations, getLocale } from 'next-intl/server'
import { stockImage } from '@/lib/stockImageCredits'
import { safeRedirect } from '@/lib/safeRedirect'
import { MagicLinkForm } from '@/components/MagicLinkForm'

export const metadata: Metadata = {
  title: 'Sign In – MyAfroWaka',
  description: 'Sign in to MyAfroWaka to save attractions and plan your Africa trip.',
  robots: { index: false, follow: false },
}

// ── Demo accounts (public knowledge, shown on login page) ─────────────────────

const DEMO_ACCOUNTS = [
  { email: 'subscriber@demo.myafrowaka.com',  role: 'Subscriber'   },
  { email: 'moderator@demo.myafrowaka.com',   role: 'Moderator'    },
  { email: 'contributor@demo.myafrowaka.com', role: 'Contributor'  },
  { email: 'author@demo.myafrowaka.com',      role: 'Author-Editor'},
  { email: 'admin@demo.myafrowaka.com',       role: 'Admin'        },
]

// Matches auth.ts's own fallback exactly — previously hardcoded separately
// here, so a real DEMO_PASSWORD env var would change what actually signs
// you in without changing what this page told you to type.
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo1234!'

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const t = await getTranslations('auth')
  const locale = await getLocale()

  // ?next= carries where to send someone after signing in — set by, e.g.,
  // the trip planner's "Save this trip" wall, so a visitor lands back on
  // the trip they were already building rather than the generic dashboard.
  // Validated against an open redirect in lib/safeRedirect.ts. `next` itself
  // arrives unprefixed (every caller builds it as a bare path, e.g.
  // '/admin' or '/plan-a-trip') — re-stamped with today's active locale via
  // getPathname so a French/Portuguese sign-in doesn't silently land back
  // on the English page. Session 5.3 look-through: without this, every
  // sign-in (Google, demo credentials, and magic-link, which all read this
  // same redirectTo) dropped the visitor's locale at the exact moment they
  // finished signing in.
  const redirectTo = getPathname({ href: safeRedirect(next, '/user-dashboard'), locale })

  // A clicked magic link lands on app/api/auth/magic-link/verify (a Route
  // Handler, not this page) and redirects back here with ?error= on
  // failure — Server Components can't set the session cookie signIn()
  // needs, so the actual sign-in can't happen directly in this render.
  const hasError = error === 'CredentialsSignin'

  return (
    <div className="min-h-screen bg-cream dark-flip-bg flex">

      {/* ── Left panel (desktop only) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        <Image
          src={stockImage('1635865897833-38bc0f8aee44')}
          alt="African cultural landmark"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/92"/>

        <div className="relative z-10 flex flex-col h-full p-12 pt-20">
          <blockquote>
            <p className="font-display font-bold text-cream leading-snug mb-5"
              style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', letterSpacing: '-0.018em' }}>
              Africa is not a destination.
              <span className="block text-gold-300 italic mt-1">It is a conversation you never want to end.</span>
            </p>
            <footer className="font-sans text-[14px] uppercase tracking-[0.16em] text-gold-400/70">
              MyAfroWaka
            </footer>
          </blockquote>
          <div className="flex-1"/>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-start justify-center px-6 py-16 overflow-y-auto">
        <div className="w-full max-w-md">

          <h1 className="font-display font-bold text-3xl text-charcoal dark-flip-text mb-2" style={{ letterSpacing: '-0.018em' }}>
            {t('welcomeBack')}
          </h1>
          <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-8">
            {t('signInAccess')}
          </p>

          {/* Error message */}
          {hasError && (
            <div className="mb-5 bg-crimson/8 border border-crimson/25 rounded-xl px-4 py-3">
              <p className="font-sans text-[14px] text-crimson">
                That sign-in link has expired or was already used — request a new one below. (If you were using a demo account button, try again.)
              </p>
            </div>
          )}

          {/* Google */}
          <div className="mb-6">
            <form action={async () => {
              'use server'
              await signIn('google', { redirectTo })
            }}>
              <button type="submit"
                className="w-full flex items-center justify-center gap-3 border border-line dark-flip-border bg-white dark-flip-card hover:bg-sand text-charcoal dark-flip-text font-display font-semibold text-[14px] py-4 rounded-xl transition-colors shadow-sm hover:shadow-[var(--shadow-soft)]">
                {/* Google's official 4-colour "G" mark. Left as literal hex
                    deliberately — this is Google's brand mark, not ours, and
                    it must render in Google's exact colours per their brand
                    guidelines regardless of our own token palette. */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('continueWithGoogle')}
              </button>
            </form>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line dark-flip-border"/></div>
            <div className="relative flex justify-center">
              <span className="bg-cream dark-flip-bg px-3 font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted">
                {t('orWithEmail')}
              </span>
            </div>
          </div>

          {/* Magic-link email sign-in — no password. Works for first-time
              and returning visitors alike; see components/MagicLinkForm.tsx
              and app/api/auth/magic-link/route.ts. */}
          <MagicLinkForm next={redirectTo} />

          {/* ── Demo accounts panel ────────────────────────────────────── */}
          <div className="mt-10 bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line dark-flip-border">
              <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/35 dark-flip-muted">
                Demo Accounts
              </p>
              <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mt-0.5">
                One click, no password needed. (Shared password, if you need it elsewhere: <span className="font-sans font-bold text-charcoal dark-flip-text">{DEMO_PASSWORD}</span>)
              </p>
            </div>
            <div className="divide-y divide-line dark-flip-border">
              {DEMO_ACCOUNTS.map(({ email, role }) => (
                <form key={email} action={async () => {
                  'use server'
                  await signIn('credentials', { email, password: DEMO_PASSWORD, redirectTo })
                }}>
                  <button type="submit" className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/50 dark:hover:bg-white/5 transition-colors text-left">
                    <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">{email}</p>
                    <span className="font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/35 dark-flip-muted">
                      {role}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </div>

          <p className="font-display text-[14px] text-charcoal/25 dark-flip-muted text-center mt-8">
            By continuing you agree to our{' '}
            <Link href="/terms" className="hover:text-charcoal/50 transition-colors">Terms</Link>{' '}and{' '}
            <Link href="/privacy" className="hover:text-charcoal/50 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
