"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ChevronDown, Phone } from "lucide-react"
import { Button } from "@/components/ui/Button"

const slides = [
  {
    image: "/background1.webp?height=1080&width=1920",
    title: "Solusi Terbaik untuk Bisnis Anda",
    description:
      "Platform SaaS yang membantu Anda mengembangkan bisnis dengan cepat, aman, dan efisien di era digital.",
    highlight: "Bisnis Anda",
  },
  {
    image: "/background2.webp?height=1080&width=1920",
    title: "Tingkatkan Produktivitas Tim",
    description: "Optimalkan kinerja tim Anda dengan fitur kolaborasi dan manajemen proyek yang terintegrasi.",
    highlight: "Produktivitas Tim",
  },
  {
    image: "/background3.webp?height=1080&width=1920",
    title: "Analisis Data yang Mendalam",
    description: "Dapatkan wawasan berharga dari data bisnis Anda untuk pengambilan keputusan yang lebih baik.",
    highlight: "Analisis Data",
  },
]

export default function HeroSection() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlideIndex}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slides[currentSlideIndex].image}')` }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Content */}
      <div className="container relative z-20 text-white text-center px-4 max-w-5xl mt-16 md:mt-20 py-12 md:py-16">
        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${currentSlideIndex}`}
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {slides[currentSlideIndex].title.split(slides[currentSlideIndex].highlight).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <motion.span
                    className="relative text-yellow-400"
                    animate={{ color: ["#FFD700", "#FFA500", "#FFD700"] }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {slides[currentSlideIndex].highlight}
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-400 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </motion.span>
                )}
              </span>
            ))}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`description-${currentSlideIndex}`}
            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-white/90 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
          >
            {slides[currentSlideIndex].description}
          </motion.p>
        </AnimatePresence>

        {/* Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* Mulai Sekarang */}
          <Link href="#about">
            <Button className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-lg">
              <span className="relative z-10 flex items-center">
                Pelajari Lebih Lanjut
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, repeatType: "reverse" }}>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.div>
              </span>
            </Button>
          </Link>

          {/* Hubungi Kami (Mirip Mulai Sekarang) */}
          <Link href="#contact">
            <Button className="group relative overflow-hidden bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg shadow-lg">
              <span className="relative z-10 flex items-center">
                Hubungi Kami
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, repeatType: "reverse" }}>
                  <Phone className="ml-2 h-5 w-5" />
                </motion.div>
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Animation */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 text-white opacity-80"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <ChevronDown className="h-10 w-10" />
      </motion.div>
    </section>
  )
}
