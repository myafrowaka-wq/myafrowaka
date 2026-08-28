import type { Metadata } from "next";
import { Familjen_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

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

export const metadata: Metadata = {
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
    locale: "en_US",
    url: "https://myafrowaka.com",
    title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
    description:
      "Verified travel guides to Africa's greatest attractions. No fabrications. Written by Africans.",
    // No manual `images` here — app/opengraph-image.tsx (a real branded card
    // built from the wordmark and design tokens, not a stock photo) supplies
    // the default OG image automatically via Next's file-convention.
  },
  twitter: {
    card: "summary_large_image",
    site: "@myafrowaka_",
    creator: "@myafrowaka_",
    title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
    description: "Verified travel guides to Africa's greatest destinations. Written by Africans.",
    // Same image, via the file convention — see note above.
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
    canonical: "https://myafrowaka.com",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${familjenGrotesk.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-crimson focus:text-cream focus:font-display focus:font-bold focus:text-sm focus:px-4 focus:py-2 focus:rounded-xl focus:outline-none focus:shadow-lg">
          Skip to content
        </a>
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
      </body>
    </html>
  );
}
