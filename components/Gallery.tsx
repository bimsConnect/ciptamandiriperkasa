"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, X, MapPin } from "lucide-react"

interface GalleryItem {
  id: number
  judul: string
  lokasi: string
  deskripsi: string | null
  gambar_url: string
}

export default function Gallery() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [properties, setProperties] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/galeri")
        const data = await response.json()

        if (data.data && Array.isArray(data.data)) {
          // Limit to 6 items for homepage
          setProperties(data.data.slice(0, 6))
        } else {
          console.error("Invalid gallery data format:", data)
          setProperties([])
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error)
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGallery()
  }, [])

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = "auto"
  }

  const navigateImage = (direction: number) => {
    if (selectedImage === null) return

    const newIndex = selectedImage + direction
    if (newIndex >= 0 && newIndex < properties.length) {
      setSelectedImage(newIndex)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Galeri Properti
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={isInView ? { opacity: 1, width: "80px" } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-primary mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Jelajahi koleksi properti eksklusif kami yang tersebar di berbagai lokasi strategis
          </motion.p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Memuat galeri properti...</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {properties.length > 0 ? (
              properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={property.gambar_url || "/placeholder.svg?height=600&width=800"}
                      alt={property.judul}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-semibold">{property.judul}</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-secondary" />
                      <p className="text-white/80">{property.lokasi}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Belum ada properti yang tersedia.</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8">Lihat Semua Properti</Button>
          </Link>
        </div>

        {/* Lightbox */}
        {selectedImage !== null && properties.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </button>

            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => navigateImage(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="relative w-full max-w-4xl h-[80vh]">
              <Image
                src={properties[selectedImage].gambar_url || "/placeholder.svg?height=600&width=800"}
                alt={properties[selectedImage].judul}
                fill
                className="object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 text-white">
                <h3 className="text-2xl font-semibold mb-2">{properties[selectedImage].judul}</h3>
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 mr-2 text-secondary" />
                  <p className="text-lg">{properties[selectedImage].lokasi}</p>
                </div>
                {properties[selectedImage].deskripsi && (
                  <p className="text-white/90">{properties[selectedImage].deskripsi}</p>
                )}
              </div>
            </div>

            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => navigateImage(1)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

