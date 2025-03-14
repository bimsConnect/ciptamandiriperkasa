"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BlogSidebar from "@/components/BlogSidebar"
import { Button } from "@/components/ui/Button"
import { Calendar, User, ArrowLeft, Facebook, Twitter, Linkedin } from "lucide-react"

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

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch blog post
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if slug is numeric (ID) or string (slug)
        const isNumeric = /^\d+$/.test(slug)
        const endpoint = isNumeric ? `/api/blog/${slug}` : `/api/blog/${slug}`

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.status}`)
        }

        const data = await response.json()

        if (!data.data) {
          throw new Error("Invalid data format received from API")
        }

        // Ensure post has a slug property
        const postWithSlug = {
          ...data.data,
          slug: data.data.slug || slug, // Use current slug as fallback
        }

        setPost(postWithSlug)
      } catch (error) {
        console.error("Error fetching blog post:", error)
        setError("Tidak dapat memuat artikel. Silakan coba lagi nanti.")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchBlogPost()
    }
  }, [slug])

  // Fetch recent posts and categories
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch("/api/blog")
        const data = await response.json()

        if (!data.data) {
          throw new Error("Invalid data format received from API")
        }

        // Get recent posts excluding current post
        const currentPostId = post?.id || -1
        const filteredPosts = data.data
          .filter((p: any) => p.id !== currentPostId)
          .slice(0, 5)
          .map((p: any) => ({
            ...p,
            slug: p.slug || `${p.id}`, // Use ID as fallback if slug is missing
          }))

        setRecentPosts(filteredPosts)

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.data.map((post: any) => post.kategori).filter((category: string | null) => category !== null)),
        ) as string[]

        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching recent posts:", error)
      }
    }

    fetchRecentPosts()
  }, [post?.id])

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch (error) {
      return dateString
    }
  }

  // Share functionality
  const sharePost = (platform: string) => {
    const url = window.location.href
    const title = post?.judul || "Artikel Blog"

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 pb-16 flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="ml-4 text-gray-600">Memuat artikel...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 pb-16 flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
          <p className="text-gray-600 mb-6">
            {error || "Maaf, artikel yang Anda cari tidak ditemukan atau telah dihapus."}
          </p>
          <Link href="/blog">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <article className="bg-white rounded-lg overflow-hidden shadow-md">
                {/* Featured Image */}
                <div className="relative h-64 md:h-96 w-full">
                  <Image
                    src={post.gambar_url || "/placeholder.svg?height=800&width=1200"}
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

                {/* Article Content */}
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center mr-4 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.tanggal_publikasi)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-1" />
                      <span>{post.penulis}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.judul}</h1>

                  <div className="text-gray-700 mb-6 italic">{post.ringkasan}</div>

                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.konten }} />

                  {/* Share Buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center">
                      <span className="text-gray-700 font-medium mr-4">Bagikan Artikel:</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full text-blue-600 hover:bg-blue-50"
                          onClick={() => sharePost("facebook")}
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full text-sky-500 hover:bg-sky-50"
                          onClick={() => sharePost("twitter")}
                        >
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full text-blue-700 hover:bg-blue-50"
                          onClick={() => sharePost("linkedin")}
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Back to Blog */}
              <div className="mt-8">
                <Link href="/blog">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <BlogSidebar categories={categories} recentPosts={recentPosts} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

