import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { findByUnsubscribeToken } from '@/lib/newsletter'
import { NewsletterUnsubscribeButton } from '@/components/NewsletterUnsubscribeButton'

// Session 5.1 — "A working unsubscribe link, which is a legal requirement,
// not a courtesy." Shows a real confirmation prompt rather than acting on
// load, for the same reason app/newsletter/confirm/[token]/page.tsx does:
// an email client or security gateway pre-fetching this link must never be
// the thing that unsubscribes someone who never clicked anything.

export const metadata: Metadata = {
  title: 'Unsubscribe – MyAfroWaka',
  robots: { index: false, follow: false },
}

export default async function NewsletterUnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const subscriber = await findByUnsubscribeToken(token)

  if (!subscriber) {
    return (
      <div className="min-h-screen bg-cream dark-flip-bg flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="font-display font-bold text-2xl text-charcoal dark-flip-text mb-3">This unsubscribe link isn&rsquo;t valid.</h1>
          <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-6">
            If you&rsquo;re trying to stop MyAfroWaka emails, contact{' '}
            <a href="mailto:myafrowaka@gmail.com" className="text-crimson hover:text-crimson/70 transition-colors">myafrowaka@gmail.com</a> and we&rsquo;ll remove you directly.
          </p>
          <Link href="/" className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
            Back to MyAfroWaka &#8594;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark-flip-bg flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text text-center mb-2"
          style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.02em' }}>
          {subscriber.status === 'unsubscribed' ? 'Already unsubscribed' : 'Sorry to see you go'}
        </h1>
        <p className="font-sans text-charcoal/55 dark-flip-muted text-center mb-8">
          {subscriber.status === 'unsubscribed'
            ? `${subscriber.email} isn't receiving emails from us.`
            : `Stop sending MyAfroWaka emails to ${subscriber.email}?`}
        </p>
        <div className="bg-ink rounded-2xl p-6">
          {subscriber.status === 'unsubscribed' ? (
            <p className="font-sans text-sm text-cream/70 text-center">Nothing else to do — you can sign up again any time at <Link href="/newsletter" className="text-gold-400 hover:text-gold-300 transition-colors">/newsletter</Link>.</p>
          ) : (
            <NewsletterUnsubscribeButton token={token} />
          )}
        </div>
      </div>
    </div>
  )
}
