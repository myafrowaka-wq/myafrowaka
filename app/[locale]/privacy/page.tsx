import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { hreflangAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy – MyAfroWaka' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  description: 'How MyAfroWaka collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://myafrowaka.com/privacy', languages: hreflangAlternates('https://myafrowaka.com/privacy') },
}

// Session 6.3 (WDOS gate run) — this page (and terms/page.tsx, identically)
// never got the dark-flip-*/dark:prose-* treatment every other page in the
// app uses. The site's body genuinely switches to a dark background in
// dark mode regardless, so with nothing here to follow — charcoal text
// stayed charcoal, on a body that had already gone dark underneath it.
// axe-core caught 24 real, near-invisible text elements as a result: this
// wasn't a subtle opacity tweak, dark-mode readers of this page were
// getting almost-black text on an almost-black background.
//
// A re-run of axe-core after that fix caught one more, different bug on
// this same page: the mailto link's text-ochre-600 (#984F31) is a fine
// 5.4:1 against the light-mode bg-cream card, but nobody had ever checked
// it against the dark-mode-flipped ink background — 2.95:1, the same class
// of "designed for one theme, never re-checked in the other" bug as the
// text-crimson fix in globals.css. ochre-400 is the existing project
// convention for a dark-mode-safe ochre accent (see components/Nav.tsx's
// own dark:hover:text-ochre-400) and measures 5.09:1 against ink.

export default function PrivacyPage() {
  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="font-sans text-xs uppercase tracking-wider text-charcoal/65 dark-flip-muted mb-8 flex gap-1">
          <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl text-charcoal dark-flip-text mb-2">Privacy Policy</h1>
        <p className="font-sans text-xs text-charcoal/65 dark-flip-muted uppercase tracking-wider mb-8">Last updated: June 2026</p>

        <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-charcoal dark:prose-headings:text-cream prose-h2:text-2xl prose-p:text-charcoal/80 dark:prose-p:text-cream/70 prose-p:leading-relaxed prose-li:text-charcoal/80 dark:prose-li:text-cream/70 prose-strong:text-charcoal dark:prose-strong:text-cream">
          <p>
            MyAfroWaka (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights in relation to it.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul>
            <li>Email address when you subscribe to our newsletter</li>
            <li>Name and email when you contact us</li>
            <li>Usage data through analytics (pages visited, time on site)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To send newsletters and travel guides you have subscribed to. Newsletter signup uses double opt-in: after you sign up, we send one confirmation email, and no newsletter content goes out unless you click the link in it. Every newsletter email, including that first confirmation one, carries a working unsubscribe link, no login required</li>
            <li>To respond to your enquiries</li>
            <li>To improve our website and content</li>
            <li>We do not sell your personal data to third parties</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use essential cookies to make our website function. We may use analytics cookies to understand how visitors use our site. You can disable cookies in your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use the following third-party services which may process your data: Vercel (hosting), Sanity (content management), and newsletter delivery providers. Each has their own privacy policy.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at myafrowaka@gmail.com.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions: <a href="mailto:myafrowaka@gmail.com" className="text-ochre-600 dark:text-ochre-400 no-underline hover:underline">myafrowaka@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
