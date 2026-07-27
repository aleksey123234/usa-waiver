import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "./analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "USA Waiver Canada | U.S. Entry Waiver Help for Canadians",
  description:
    "Confidential U.S. Entry Waiver application support for Canadians with a criminal record, previous border denial, overstay or removal.",
  keywords: [
    "USA waiver Canada",
    "US entry waiver",
    "US waiver for Canadians",
    "I-192 waiver",
    "criminal record enter USA",
  ],
  openGraph: {
    title: "USA Waiver Canada",
    description: "Clear support for Canadians preparing a U.S. Entry Waiver application.",
    type: "website",
    locale: "en_CA",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
