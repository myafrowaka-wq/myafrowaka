import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy – MyAfroWaka',
  description: 'How MyAfroWaka collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-8 flex gap-1">
        <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">Privacy Policy</span>
      </nav>

      <h1 className="font-display text-4xl text-charcoal mb-2">Privacy Policy</h1>
      <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider mb-8">Last updated: June 2026</p>

      <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-charcoal prose-h2:text-2xl prose-p:text-charcoal/80 prose-p:leading-relaxed prose-li:text-charcoal/80">
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
          <li>To send newsletters and travel guides you have subscribed to</li>
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
          For privacy questions: <a href="mailto:myafrowaka@gmail.com" className="text-ochre-600 no-underline hover:underline">myafrowaka@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
