import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { TypewriterHero } from '@/components/TypewriterHero'

export const metadata: Metadata = {
  title: 'Contact MyAfroWaka – Get in Touch',
  description:
    'Reach the MyAfroWaka team for attraction corrections, partnerships, press requests, or travel questions. We read every message.',
}

const REASONS = [
  'General Enquiry',
  'Partnership / Sponsorship',
  'Attraction Data Correction',
  'Press / Media',
  'Tourism Board Enquiry',
  'Tip a Destination',
  'Other',
]

export default function ContactPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[420px] flex items-center">
        <Image
          src="https://picsum.photos/seed/contact-africa-village-hero/1920/700"
          alt="African cultural destination"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/70 to-ink/95"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 sm:py-28">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-5">Contact</p>
          <h1
            className="font-display font-extrabold text-cream max-w-2xl"
            style={{ fontSize: 'clamp(32px, 4vw, 54px)', lineHeight: '0.95', letterSpacing: '-0.022em' }}
          >
            <TypewriterHero
              speed={30}
              lines={[
                { text: 'We Read' },
                { text: ' Every Message.' },
              ]}
            />
          </h1>
          <p className="font-sans text-cream/60 mt-4 max-w-lg leading-relaxed"
            style={{ fontSize: 'clamp(13px, 1.4vw, 16px)' }}>
            Corrections, partnerships, press, or a tip about somewhere we should cover. Send it here and someone will respond.
          </p>
        </div>
      </div>

      {/* ── Body: form + sidebar ────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">

            {/* ── Contact form (2/3) ──────────────────────────────────── */}
            <div className="lg:col-span-2">

              <form
                className="space-y-6"
                action={`mailto:info@myafrowaka.com`}
                method="GET"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Amara Okafor"
                      className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 dark:placeholder:text-cream/25 focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 dark:placeholder:text-cream/25 focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
                    Reason for Contact
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      className="w-full appearance-none border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text focus:outline-none focus:border-gold-400 transition-colors pr-10"
                    >
                      {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
                    Message
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={6}
                    placeholder="Tell us what is on your mind. Specific is always better."
                    className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2.5 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all btn-magnetic shadow-[0_4px_24px_rgba(162,46,41,0.25)]"
                >
                  Send Message
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>

                <p className="font-sans text-[12px] text-charcoal/35 dark-flip-muted">
                  Your message goes directly to the editorial team. We do not use auto-replies.
                </p>
              </form>
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Direct contact card */}
              <div className="bg-ink rounded-3xl p-7 text-cream">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400 mb-3">Direct Email</p>
                <p className="font-display font-bold text-lg mb-3" style={{ letterSpacing: '-0.012em' }}>
                  Rather send an email?
                </p>
                <a
                  href="mailto:info@myafrowaka.com"
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400 hover:text-gold-300 transition-colors break-all"
                >
                  info@myafrowaka.com
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </a>
              </div>

              {/* Response time */}
              <div className="bg-sand dark-flip-surf rounded-3xl p-7 border border-line dark-flip-border">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/40 dark-flip-muted mb-4">What to Expect</p>
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-cream dark-flip-card border border-line dark-flip-border flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-charcoal/50 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-[12px] text-charcoal dark-flip-text">Response time</p>
                      <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted mt-0.5">Within 2 business days</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-cream dark-flip-card border border-line dark-flip-border flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-charcoal/50 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-[12px] text-charcoal dark-flip-text">Based in</p>
                      <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted mt-0.5">Abuja, Nigeria</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-cream dark-flip-card border border-line dark-flip-border flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-charcoal/50 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-[12px] text-charcoal dark-flip-text">Coverage</p>
                      <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted mt-0.5">Pan-African editorial team</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* What to include */}
              <div className="border border-line dark-flip-border rounded-3xl p-7">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/40 dark-flip-muted mb-5">For Faster Replies</p>
                <ul className="space-y-3">
                  {[
                    'Attraction corrections: include the attraction name, country, and the specific field that needs updating.',
                    'Partnerships: mention the type of collaboration and your audience or platform.',
                    'Press requests: include your publication, deadline, and what you need from us.',
                    'Tips: the more specific, the better. Country, region, and what makes it worth covering.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[8px] text-gold-500 mt-1 shrink-0">0{i + 1}</span>
                      <p className="font-sans text-[12px] text-charcoal/60 dark-flip-muted leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social links */}
              <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/40 dark-flip-muted mb-4">Find Us</p>
                <div className="space-y-2">
                  {[
                    { label: 'Instagram',  handle: '@myafrowaka_',     href: 'https://instagram.com/myafrowaka_' },
                    { label: 'X (Twitter)', handle: '@myafrowaka',     href: 'https://twitter.com/myafrowaka'   },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between py-2 group">
                      <span className="font-sans text-[13px] text-charcoal/60 dark-flip-muted group-hover:text-crimson transition-colors">{s.label}</span>
                      <span className="font-mono text-[10px] text-charcoal/35 dark-flip-muted group-hover:text-crimson transition-colors">{s.handle}</span>
                    </a>
                  ))}
                </div>
              </div>

              <Link href="/about"
                className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/35 dark-flip-muted mb-1">Learn more</p>
                  <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">About MyAfroWaka</p>
                </div>
                <svg className="w-5 h-5 text-charcoal/30 group-hover:text-crimson transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
