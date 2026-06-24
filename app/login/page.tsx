import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In – MyAfroWaka',
  description: 'Sign in to MyAfroWaka to save attractions and plan your Africa trip.',
  robots: { index: false, follow: false },
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const isSignup = searchParams?.tab === 'signup'

  return (
    <div className="min-h-screen bg-cream dark-flip-bg flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://picsum.photos/seed/login-africa-landscape/900/1200"
          alt="African landscape"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-transparent"/>
        <div className="relative z-10 flex flex-col justify-end p-12">
          <Link href="/" className="mb-auto pt-4">
            <Image src="/logo-white.png" alt="MyAfroWaka" width={200} height={52} className="h-10 w-auto"/>
          </Link>
          <blockquote className="mt-auto">
            <p className="font-display font-bold text-3xl text-cream leading-snug mb-4">
              Africa is not a destination. It is a conversation you never want to end.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-400">
              MyAfroWaka
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex justify-center mb-10 lg:hidden">
            <Image src="/logo-dark.png" alt="MyAfroWaka" width={200} height={52} className="h-10 w-auto dark:hidden"/>
            <Image src="/logo-white.png" alt="MyAfroWaka" width={200} height={52} className="h-10 w-auto hidden dark:block"/>
          </Link>

          <h1 className="font-display font-bold text-3xl text-charcoal dark-flip-text mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-8">
            {isSignup
              ? 'Join 12,400+ travellers exploring Africa.'
              : 'Sign in to access your saved trips and itineraries.'}
          </p>

          {/* Social sign-in */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-line dark-flip-border bg-white dark-flip-card hover:bg-sand hover:dark:bg-white/8 text-charcoal dark-flip-text font-display font-semibold text-[14px] py-3.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-line dark-flip-border bg-white dark-flip-card hover:bg-sand hover:dark:bg-white/8 text-charcoal dark-flip-text font-display font-semibold text-[14px] py-3.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-charcoal dark-flip-text" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.419 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line dark-flip-border"/>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream dark-flip-bg px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/35 dark-flip-muted">or with email</span>
            </div>
          </div>

          {/* Email form */}
          <form className="space-y-4">
            {isSignup && (
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted block mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ochre-400 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted block mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ochre-400 transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted block mb-1.5">Password</label>
              <input
                type="password"
                placeholder={isSignup ? 'Create a strong password' : 'Enter your password'}
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ochre-400 transition-colors"
              />
            </div>

            {!isSignup && (
              <div className="flex justify-end">
                <button type="button" className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-500 hover:text-ochre-600 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-ink hover:bg-charcoal-600 text-cream font-display font-bold text-[13px] uppercase tracking-[0.10em] py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="font-sans text-sm text-center text-charcoal/45 dark-flip-muted mt-6">
            {isSignup ? (
              <>Already have an account? <Link href="/login" className="text-ochre-600 hover:text-ochre-700 font-semibold">Sign in</Link></>
            ) : (
              <>No account? <Link href="/login?tab=signup" className="text-ochre-600 hover:text-ochre-700 font-semibold">Create one free</Link></>
            )}
          </p>

          <p className="font-mono text-[9px] text-charcoal/25 dark-flip-muted text-center mt-8">
            By continuing you agree to our{' '}
            <Link href="/terms" className="hover:text-ochre-500 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:text-ochre-500 transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
