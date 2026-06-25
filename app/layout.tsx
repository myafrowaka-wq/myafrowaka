import type { Metadata } from "next";
import { Poppins, Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { CustomCursor } from "@/components/CustomCursor";

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

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyAfroWaka – Africa Explained by Africans",
    template: "%s – MyAfroWaka",
  },
  description:
    "557 verified travel guides across 47 African countries. From the Pyramids of Giza to the gorilla forests of Uganda. Written by Africans, for the world.",
  metadataBase: new URL("https://myafrowaka.com"),
  keywords: ["Africa travel", "African destinations", "travel guides Africa", "safari", "Egypt", "Kenya", "Morocco"],
  openGraph: {
    siteName: "MyAfroWaka",
    type: "website",
    locale: "en_US",
    url: "https://myafrowaka.com",
    title: "MyAfroWaka – Discover Africa Beyond the Stereotype",
    description:
      "Verified travel guides to 557 African attractions across 47 countries. No fabrications. Written by Africans.",
    images: [
      {
        url: "https://images.unsplash.com/photo-GNqLWDUKwDk?auto=format&fit=crop&w=1200&h=630&q=80",
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
    description: "557 verified travel guides across 47 African countries.",
    images: ["https://images.unsplash.com/photo-GNqLWDUKwDk?auto=format&fit=crop&w=1200&h=630&q=80"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${outfit.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <SessionProviderWrapper>
          <ThemeProvider>
            <CustomCursor />
            <ScrollRevealInit />
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
            <NewsletterPopup />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
