import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import AnalyticsTracker from "@/components/AnalyticsTracker"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cipta Mandiri Perkasa | Premium Real Estate Solutions",
  description:
    "Find your dream property with Brick Property. We offer premium real estate solutions with a focus on quality and customer satisfaction.",
  keywords: ["real estate", "property", "homes", "apartments", "investment property", "luxury homes"],
  openGraph: {
    title: "Cipta Mandiri Perkasa | Premium Real Estate Solutions",
    description:
      "Find your dream property with Brick Property. We offer premium real estate solutions with a focus on quality and customer satisfaction.",
    url: "https://brickproperty.com",
    siteName: "Cipta Mandiri Perkasa",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Brick Property",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <AnalyticsTracker />
        </ThemeProvider>
      </body>
    </html>
  )
}

