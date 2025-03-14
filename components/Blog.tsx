"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Calendar, User, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

export default function BlogSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/blog")
        const data = await response.json()

        if (data.data && Array.isArray(data.data)) {
          // Ensure all posts have a slug property and limit to 3
          const postsWithSlug = data.data.slice(0, 3).map((post: any) => ({
            ...post,
            slug: post.slug || `${post.id}`, // Use ID as fallback if slug is missing
          }))

          setBlogPosts(postsWithSlug)
        } else {
          console.error("Invalid blog data format:", data)
          setBlogPosts([])
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        setBlogPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch (error) {
      return dateString
    }
  }

  return (
    <section id="blog" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Blog & Artikel
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
            Dapatkan informasi terbaru dan tips berguna seputar properti dan real estate
          </motion.p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Memuat artikel blog...</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.gambar_url || "/placeholder.svg?height=400&width=600"}
                      alt={post.judul}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-secondary text-black text-xs font-semibold px-3 py-1 rounded">
                      {post.kategori || "Artikel"}
                    </div>
                  </div>
                  <div className="p-6">
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
                </motion.article>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Belum ada artikel blog yang tersedia.</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8">Lihat Semua Artikel</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

