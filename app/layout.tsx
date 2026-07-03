import type { Metadata } from "next";
import { Poppins, Outfit, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { CustomCursor } from "@/components/CustomCursor";
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
    images: [
      {
        url: "https://picsum.photos/seed/myafrowaka-og/1200/630",
        width: 1200,
        height: 630,
        alt: "African wildlife silhouette against golden sunset sky",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@myafrowaka_",
    creator: "@myafrowaka_",
    title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
    description: "Verified travel guides to Africa's greatest destinations. Written by Africans.",
    images: ["https://picsum.photos/seed/myafrowaka-og/1200/630"],
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
      className={`${poppins.variable} ${outfit.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-crimson focus:text-cream focus:font-display focus:font-bold focus:text-sm focus:px-4 focus:py-2 focus:rounded-xl focus:outline-none focus:shadow-lg">
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <SessionProviderWrapper>
            <ThemeProvider>
              <CustomCursor />
              <ScrollRevealInit />
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
