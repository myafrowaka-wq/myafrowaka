import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use – MyAfroWaka',
  description: 'Terms and conditions for using the MyAfroWaka website.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-8 flex gap-1">
        <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-charcoal">Terms of Use</span>
      </nav>

      <h1 className="font-display text-4xl text-charcoal mb-2">Terms of Use</h1>
      <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider mb-8">Last updated: June 2026</p>

      <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-charcoal prose-h2:text-2xl prose-p:text-charcoal/80 prose-p:leading-relaxed prose-li:text-charcoal/80">
        <p>
          By using the MyAfroWaka website, you agree to these terms. Please read them carefully.
        </p>

        <h2>Content Accuracy</h2>
        <p>
          We work to ensure our travel guides are accurate and up to date. However, travel information including entry fees, opening hours, visa requirements, and safety conditions change. Always verify critical information from official sources before travel. MyAfroWaka is not liable for inaccuracies or outdated information.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          All content on MyAfroWaka including text, images, and guides is the property of MyAfroWaka unless otherwise stated. You may not reproduce, distribute, or republish our content without written permission.
        </p>

        <h2>User Conduct</h2>
        <p>When using our website, you agree not to:</p>
        <ul>
          <li>Use our content for commercial purposes without permission</li>
          <li>Attempt to access systems or data you are not authorised to access</li>
          <li>Post false, misleading, or harmful content</li>
        </ul>

        <h2>External Links</h2>
        <p>
          Our guides may link to external websites for reference. We are not responsible for the content or privacy practices of those sites.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          MyAfroWaka provides travel information for guidance only. We are not responsible for any loss, injury, or inconvenience arising from travel decisions made based on our content.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the website after changes constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href="mailto:myafrowaka@gmail.com" className="text-ochre-600 no-underline hover:underline">myafrowaka@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
