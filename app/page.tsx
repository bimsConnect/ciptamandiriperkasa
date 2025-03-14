import Hero from "@/components/Hero"
import Navbar from "@/components/Navbar"
import About from "@/components/About"
import Gallery from "@/components/Gallery"
import BlogSection from "@/components/Blog"
import Testimonials from "@/components/Testimonials"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

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

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <BlogSection />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}

