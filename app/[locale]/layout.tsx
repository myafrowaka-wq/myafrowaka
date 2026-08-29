import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, type AppLocale } from '@/i18n/routing'

// Session 5.3 — this is what app/layout.tsx (root) used to be in full,
// minus the <html>/<body> tags themselves (only the root layout is
// allowed to render those). Every route in the app now lives under this
// segment — including admin/dashboard/studio/login, which already have
// their own self-contained sidebar chrome and don't depend on anything
// locale-specific, so moving them here rather than carving out a second
// parallel provider tree preserves their exact current behavior (same
// Nav/Footer/session/theme wrapping they've always had) with the least
// structural risk. Only app/api/** and app/go/[slug] (route handlers,
// nothing to render or translate) live outside this tree.

const OG_LOCALE: Record<AppLocale, string> = { en: 'en_US', fr: 'fr_FR', pt: 'pt_PT' }

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale

  // hreflang — "Add hreflang tags so Google knows which version to show
  // which country." x-default points at the unprefixed (English) URL,
  // matching localePrefix: 'as-needed' actually serving English there.
  const languages: Record<string, string> = { 'x-default': 'https://myafrowaka.com' }
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? 'https://myafrowaka.com' : `https://myafrowaka.com/${l}`
  }

  return {
    title: {
      default: "MyAfroWaka – Africa Explained by Africans",
      template: "%s – MyAfroWaka",
    },
    description:
      "Verified travel guides to Africa's greatest destinations. From the Pyramids of Giza to the gorilla forests of Uganda. Written by Africans, for the world.",
    metadataBase: new URL("https://myafrowaka.com"),
    keywords: ["Africa travel", "African destinations", "travel guides Africa", "safari", "Egypt", "Kenya", "Morocco"],
    openGraph: {
      siteName: "MyAfroWaka",
      type: "website",
      locale: OG_LOCALE[safeLocale as AppLocale],
      url: "https://myafrowaka.com",
      title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
      description:
        "Verified travel guides to Africa's greatest attractions. No fabrications. Written by Africans.",
      // No manual `images` here — app/opengraph-image.tsx (a real branded
      // card built from the wordmark and design tokens, not a stock
      // photo) supplies the default OG image automatically via Next's
      // file-convention.
    },
    twitter: {
      card: "summary_large_image",
      site: "@myafrowaka_",
      creator: "@myafrowaka_",
      title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
      description: "Verified travel guides to Africa's greatest destinations. Written by Africans.",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: languages[safeLocale],
      languages,
    },
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Required by next-intl for static rendering of this segment — tells
  // every server component below which locale is active without each one
  // having to re-derive it.
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProviderWrapper>
        <ThemeProvider>
          <Nav />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <NewsletterPopup />
        </ThemeProvider>
      </SessionProviderWrapper>
    </NextIntlClientProvider>
  );
}
