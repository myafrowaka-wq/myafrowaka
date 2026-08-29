import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { client } from '@/sanity/lib/client'
import { NEWSLETTER_COUNTRIES_QUERY } from '@/sanity/lib/queries'
import { NewsletterSignupForm } from '@/components/NewsletterSignupForm'
import { hreflangAlternates } from '@/lib/hreflang'

// Session 5.1 — "A proper /newsletter page explaining what you send and how
// often." The popup used to promise "Africa in Your Inbox Every Week" with
// nothing behind either half of that claim — no storage, no schedule. This
// is the honest version: real content categories the site actually
// produces, and a cadence that doesn't promise more than a small team can
// keep.

export const metadata: Metadata = {
  title: 'Newsletter – MyAfroWaka',
  description: 'Real African travel guides, verified events, and hidden gems — sent when there is something worth sending, not on a fixed clock.',
  alternates: { canonical: 'https://myafrowaka.com/newsletter', languages: hreflangAlternates('https://myafrowaka.com/newsletter') },
}

interface Country { _id: string; name: string; slug: string; countryCode?: string }

export default async function NewsletterPage() {
  const countries = await client.fetch<Country[]>(NEWSLETTER_COUNTRIES_QUERY).catch(() => [])

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
        <div className="max-w-2xl">
          <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">Newsletter</p>
          <h1 className="font-display font-extrabold text-charcoal dark-flip-text mb-5"
            style={{ fontSize: 'clamp(30px, 5vw, 46px)', letterSpacing: '-0.02em', lineHeight: '1.08' }}>
            Africa, in your inbox — honestly
          </h1>
          <p className="font-sans text-charcoal/65 dark-flip-muted text-[17px] leading-relaxed mb-4">
            No five-second popup lying to you, no fake &ldquo;you&rsquo;re in.&rdquo; This is a real subscription: you confirm by email, and you can leave from a working link in every message we send — not a promise, an actual mechanism.
          </p>
        </div>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 mt-10">
          <div>
            <h2 className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-4">What actually goes out</h2>
            <ul className="space-y-4 mb-8">
              {[
                { t: 'Verified events', d: 'A festival or gathering whose dates we’ve actually confirmed against an official source — never a guess dressed up as a fact.' },
                { t: 'Real country guides', d: 'The overviews, safety notes, and “when to go” detail from our 47 country pages — not a rehash of the same ten cities every other list runs.' },
                { t: 'Hidden gems', d: 'Attractions worth knowing about that don’t already have a thousand identical blog posts.' },
              ].map(item => (
                <li key={item.t} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2.5 shrink-0" />
                  <div>
                    <p className="font-display font-semibold text-[15px] text-charcoal dark-flip-text">{item.t}</p>
                    <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed mt-0.5">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-3">How often</h2>
            <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed mb-8">
              Realistically, a few times a month — never more than weekly, and never just to fill a schedule. If there&rsquo;s nothing worth your inbox, we don&rsquo;t send anything that week. Tell us your home country and interests below and we&rsquo;ll send you less, not more — just what&rsquo;s relevant.
            </p>

            <h2 className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-3">The mechanics, plainly</h2>
            <ul className="space-y-2 font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed">
              <li>You confirm by clicking a real link in a real email — double opt-in, not a checkbox nobody reads.</li>
              <li>Every email carries a working unsubscribe link. One click, no login, no &ldquo;are you sure&rdquo; maze.</li>
              <li>We don&rsquo;t sell or share your address. See the <Link href="/privacy" className="text-crimson hover:text-crimson/70 transition-colors underline">privacy policy</Link>.</li>
            </ul>
          </div>

          <div>
            <NewsletterSignupForm countries={countries} source="newsletter-page" />
          </div>
        </div>
      </div>
    </div>
  )
}
