import { Familjen_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { getLocale } from 'next-intl/server'

// Session 5.3 — this is the ONLY layout allowed to render <html>/<body> in
// the whole app (a hard Next.js App Router rule), which is why it stays
// this minimal: fonts, global CSS, and the html lang attribute, resolved
// via next-intl's getLocale() so it's correct for every route — including
// api/go (outside the [locale] tree entirely, where it resolves to the
// default locale) as well as everything under app/[locale]/layout.tsx,
// which owns the actual page chrome (Nav, Footer, providers) and the
// site's real <title>/<meta> — see that file for both.

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "600"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${familjenGrotesk.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-crimson focus:text-cream focus:font-display focus:font-bold focus:text-sm focus:px-4 focus:py-2 focus:rounded-xl focus:outline-none focus:shadow-lg">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
