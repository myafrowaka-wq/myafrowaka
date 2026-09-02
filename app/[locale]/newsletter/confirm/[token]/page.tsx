import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { findByConfirmToken, isConfirmTokenExpired } from '@/lib/newsletter'
import { NewsletterConfirmButton } from '@/components/NewsletterConfirmButton'

// Session 5.1 — the double opt-in landing page. Deliberately shows a real
// "Confirm subscription" button rather than confirming on load: an email
// client or corporate security gateway pre-fetching links inside an email
// is common, and if this page confirmed on a bare GET, that alone could
// subscribe someone who never clicked anything. Same shape as
// app/trips/join/[token]/page.tsx from Session 4.3.

export const metadata: Metadata = {
  title: { absolute: 'Confirm Subscription – MyAfroWaka' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  robots: { index: false, follow: false },
}

export default async function NewsletterConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const subscriber = await findByConfirmToken(token)
  // Only a still-pending subscriber's token can meaningfully "expire" —
  // confirmSubscription() applies this same rule server-side, this is just
  // the page reflecting it honestly instead of showing the confirm button
  // for a link that's actually dead.
  const expired = subscriber?.status === 'pending' && isConfirmTokenExpired(subscriber.confirmTokenIssuedAt)

  if (!subscriber) {
    return (
      <div className="min-h-screen bg-cream dark-flip-bg flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="font-display font-bold text-2xl text-charcoal dark-flip-text mb-3">This confirmation link isn&rsquo;t valid.</h1>
          <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-6">It may have been mistyped, or already used.</p>
          <Link href="/newsletter" className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
            Sign up again &#8594;
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark-flip-bg flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3 text-center">Newsletter</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text text-center mb-2"
          style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.02em' }}>
          Confirm your subscription
        </h1>
        <p className="font-sans text-charcoal/55 dark-flip-muted text-center mb-8">
          {subscriber.status === 'confirmed'
            ? `${subscriber.email} is already confirmed.`
            : subscriber.status === 'unsubscribed'
            ? `${subscriber.email} unsubscribed since this link was sent.`
            : expired
            ? `This link for ${subscriber.email} has expired.`
            : `One click and ${subscriber.email} is on the list.`}
        </p>
        <div className="bg-ink rounded-2xl p-6">
          {subscriber.status === 'confirmed' ? (
            <p className="font-sans text-sm text-cream/70 text-center">You&rsquo;re already confirmed. Nothing else to do.</p>
          ) : subscriber.status === 'unsubscribed' ? (
            <div className="text-center">
              <p className="font-sans text-sm text-cream/70 mb-4">This old confirmation link can&rsquo;t reactivate a cancelled subscription.</p>
              <Link href="/newsletter" className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400 hover:text-gold-300 transition-colors">
                Sign up again &#8594;
              </Link>
            </div>
          ) : expired ? (
            <div className="text-center">
              <p className="font-sans text-sm text-cream/70 mb-4">Confirmation links expire after 48 hours. Sign up again for a fresh one.</p>
              <Link href="/newsletter" className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400 hover:text-gold-300 transition-colors">
                Sign up again &#8594;
              </Link>
            </div>
          ) : (
            <NewsletterConfirmButton token={token} />
          )}
        </div>
      </div>
    </div>
  )
}
