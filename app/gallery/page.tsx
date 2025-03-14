"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination"
import { ChevronLeft, ChevronRight, X, Search, MapPin } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface GalleryItem {
  id: number
  judul: string
  lokasi: string
  deskripsi: string | null
  gambar_url: string
}

export default function GalleryPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<GalleryItem[]>([])
  const [filteredProperties, setFilteredProperties] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 9

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/galeri")
        const data = await response.json()
        setProperties(data.data)
        setFilteredProperties(data.data)
        setTotalPages(Math.ceil(data.data.length / itemsPerPage))
      } catch (error) {
        console.error("Error fetching gallery data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGallery()
  }, [])

  // Handle search and filter
  useEffect(() => {
    let result = [...properties]

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter((item) => item.lokasi === locationFilter)
    }

    setFilteredProperties(result)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, locationFilter, properties])

  // Get unique locations for filter
  const locations = [...new Set(properties.map((item) => item.lokasi))].sort()

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProperties.slice(startIndex, endIndex)
  }

  // Lightbox functions
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
    if (newIndex >= 0 && newIndex < filteredProperties.length) {
      setSelectedImage(newIndex)
    }
  }

  // Animation variants
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
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri Properti</h1>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jelajahi koleksi properti eksklusif kami yang tersebar di berbagai lokasi strategis
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari properti..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Filter lokasi" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || locationFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                }}
                className="md:w-auto"
              >
                Reset Filter <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Memuat galeri properti...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">Tidak ada properti yang sesuai dengan filter Anda.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                }}
                className="mt-4"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {getCurrentPageItems().map((property, index) => (
                  <motion.div
                    key={property.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer bg-white"
                    onClick={() => openLightbox(index + (currentPage - 1) * itemsPerPage)}
                  >
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={property.gambar_url || "/placeholder.svg"}
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
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && filteredProperties.length > 0 && (
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
              src={filteredProperties[selectedImage].gambar_url || "/placeholder.svg"}
              alt={filteredProperties[selectedImage].judul}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 text-white">
              <h3 className="text-2xl font-semibold mb-2">{filteredProperties[selectedImage].judul}</h3>
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 mr-2 text-secondary" />
                <p className="text-lg">{filteredProperties[selectedImage].lokasi}</p>
              </div>
              {filteredProperties[selectedImage].deskripsi && (
                <p className="text-white/90">{filteredProperties[selectedImage].deskripsi}</p>
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

      <Footer />
    </main>
  )
}

