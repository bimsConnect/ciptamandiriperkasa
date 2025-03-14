"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Calendar, Search, Tag, Clock, ArrowRight } from "lucide-react"

interface BlogPost {
  id: number
  judul: string
  ringkasan?: string
  gambar_url: string | null
  kategori: string | null
  penulis: string
  tanggal_publikasi: string
  slug: string
}

interface BlogSidebarProps {
  categories: string[]
  selectedCategory?: string | null
  onCategorySelect?: (category: string | null) => void
  recentPosts: BlogPost[]
}

export default function BlogSidebar({ categories, selectedCategory, onCategorySelect, recentPosts }: BlogSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch (error) {
      return dateString
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality if needed
    console.log("Searching for:", searchTerm)
  }

  return (
    <div className="lg:w-1/3 space-y-6">
      {/* Search Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Cari Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kata kunci..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="mt-2 w-full bg-primary hover:bg-primary/90">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories Card */}
      {categories && categories.length > 0 && (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Tag className="h-5 w-5 mr-2 text-primary" />
              Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  !selectedCategory ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
                onClick={() => onCategorySelect && onCategorySelect(null)}
              >
                Semua Kategori
              </div>
              {categories.map((category) => (
                <div
                  key={category}
                  className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    selectedCategory === category ? "bg-primary text-white" : "hover:bg-gray-100"
                  }`}
                  onClick={() => onCategorySelect && onCategorySelect(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Artikel Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <div className="flex gap-3 group">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={post.gambar_url || "/placeholder.svg?height=200&width=200"}
                        alt={post.judul}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {post.judul}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(post.tanggal_publikasi)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Belum ada artikel terbaru</p>
          )}

          <div className="mt-4 text-center">
            <Link href="/blog">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                Lihat Semua Artikel <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Subscribe Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Berlangganan Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Dapatkan artikel terbaru dan tips properti langsung ke email Anda
          </p>
          <form className="space-y-2">
            <Input placeholder="Nama Anda" />
            <Input placeholder="Email Anda" type="email" />
            <Button className="w-full bg-primary hover:bg-primary/90">Berlangganan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

