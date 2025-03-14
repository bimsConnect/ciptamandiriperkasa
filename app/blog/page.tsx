"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BlogSidebar from "@/components/BlogSidebar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Calendar, User, ArrowRight, Search } from "lucide-react"

interface BlogPost {
  id: number
  judul: string
  ringkasan: string
  konten: string
  gambar_url: string | null
  kategori: string | null
  penulis: string
  tanggal_publikasi: string
  slug: string
}

export default function BlogPage() {
  const searchParams = useSearchParams()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get category from URL if present
  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/blog")
        const data = await response.json()
        setBlogPosts(data.data)

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            data.data.map((post: BlogPost) => post.kategori).filter((category: string | null) => category !== null),
          ),
        ) as string[]

        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = [...blogPosts]

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.penulis.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.kategori === selectedCategory)
    }

    setFilteredPosts(filtered)
  }, [blogPosts, searchTerm, selectedCategory])

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch (error) {
      return dateString
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog & Artikel</h1>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dapatkan informasi terbaru dan tips berguna seputar properti dan real estate
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari artikel..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-gray-600">Memuat artikel blog...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">Tidak ada artikel yang sesuai dengan pencarian Anda.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory(null)
                    }}
                    className="mt-4"
                  >
                    Reset Filter
                  </Button>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                  {filteredPosts.map((post) => (
                    <motion.article
                      key={post.id}
                      variants={itemVariants}
                      className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-2"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 relative h-48 md:h-auto">
                          <Image
                            src={post.gambar_url || "/placeholder.svg"}
                            alt={post.judul}
                            fill
                            className="object-cover"
                          />
                          {post.kategori && (
                            <div className="absolute top-4 left-4 bg-secondary text-black text-xs font-semibold px-3 py-1 rounded">
                              {post.kategori}
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:w-2/3">
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <div className="flex items-center mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(post.tanggal_publikasi)}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{post.penulis}</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.judul}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.ringkasan}</p>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center text-primary font-medium hover:underline"
                          >
                            Baca Selengkapnya <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <BlogSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              recentPosts={blogPosts.slice(0, 5)}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

