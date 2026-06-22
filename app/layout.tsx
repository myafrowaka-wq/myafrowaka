import type { Metadata } from "next";
import { Fraunces, Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
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
    "557 verified travel guides across 47 African countries. From the Pyramids of Giza to the gorilla forests of Uganda, written by people who live here.",
  metadataBase: new URL("https://myafrowaka.com"),
  openGraph: {
    siteName: "MyAfroWaka",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
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
      className={`${fraunces.variable} ${outfit.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-charcoal">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
