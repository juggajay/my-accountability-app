import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Personal Accountability & Wellness App",
  description: "AI-powered accountability app for sciatica recovery, alcohol moderation, and personal goals",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark', backgroundColor: '#0a0a0a' }}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} style={{ backgroundColor: '#0a0a0a', color: '#fafafa' }}>
        <Navigation />
        <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
