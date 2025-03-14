"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/Admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import ImageUpload from "@/components/ImageUpload"

interface BlogPost {
  id: number
  judul: string
  ringkasan: string
  konten: string
  gambar_url: string | null
  kategori: string | null
  penulis: string
  tanggal_publikasi: string
}

export default function BlogPage() {
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    judul: "",
    ringkasan: "",
    konten: "",
    gambar_url: "",
    kategori: "",
    penulis: "",
  })

  // Fetch data blog
  const fetchBlog = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/blog")
      const data = await response.json()
      setBlogPosts(data.data)
    } catch (error) {
      console.error("Error mengambil data blog:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBlog()
  }, [])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image upload
  const handleImageUploaded = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      gambar_url: url,
    }))
  }

  // Open dialog for add/edit
  const openDialog = (post?: BlogPost) => {
    if (post) {
      setSelectedPost(post)
      setFormData({
        judul: post.judul,
        ringkasan: post.ringkasan,
        konten: post.konten,
        gambar_url: post.gambar_url || "",
        kategori: post.kategori || "",
        penulis: post.penulis,
      })
    } else {
      setSelectedPost(null)
      setFormData({
        judul: "",
        ringkasan: "",
        konten: "",
        gambar_url: "",
        kategori: "",
        penulis: "",
      })
    }
    setIsDialogOpen(true)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setIsDeleteDialogOpen(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input
    if (!formData.judul || !formData.ringkasan || !formData.konten || !formData.penulis) {
      alert("Judul, ringkasan, konten, dan penulis harus diisi")
      return
    }

    try {
      if (selectedPost) {
        // Update existing post
        await fetch(`/api/blog/${selectedPost.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Add new post
        await fetch("/api/blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      // Refresh data and close dialog
      fetchBlog()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error menyimpan data blog:", error)
      alert("Terjadi kesalahan saat menyimpan data")
    }
  }

  // Delete post
  const handleDelete = async () => {
    if (!selectedPost) return

    try {
      await fetch(`/api/blog/${selectedPost.id}`, {
        method: "DELETE",
      })

      // Refresh data and close dialog
      fetchBlog()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error menghapus data blog:", error)
      alert("Terjadi kesalahan saat menghapus data")
    }
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
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Blog</h1>
            <p className="text-gray-500">Kelola artikel blog yang ditampilkan di website</p>
          </div>
          <Button onClick={() => openDialog()} className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 material-ripple">
            <Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru
          </Button>
        </div>

        <Card className="material-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Daftar Artikel Blog</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada artikel blog. Klik tombol "Tulis Artikel Baru" untuk menambahkan.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Tanggal Publikasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.judul}</TableCell>
                      <TableCell>{post.kategori || "-"}</TableCell>
                      <TableCell>{post.penulis}</TableCell>
                      <TableCell>{formatDate(post.tanggal_publikasi)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openDialog(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(post)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog untuk tambah/edit blog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Edit Artikel Blog" : "Tulis Artikel Blog Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="judul" className="text-sm font-medium">
                  Judul Artikel
                </label>
                <Input id="judul" name="judul" value={formData.judul} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="ringkasan" className="text-sm font-medium">
                  Ringkasan
                </label>
                <Textarea
                  id="ringkasan"
                  name="ringkasan"
                  value={formData.ringkasan}
                  onChange={handleInputChange}
                  rows={2}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="konten" className="text-sm font-medium">
                  Konten Artikel
                </label>
                <Textarea
                  id="konten"
                  name="konten"
                  value={formData.konten}
                  onChange={handleInputChange}
                  rows={10}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="kategori" className="text-sm font-medium">
                    Kategori
                  </label>
                  <Input
                    id="kategori"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    placeholder="Contoh: Tips & Advice, Investment, Design"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="penulis" className="text-sm font-medium">
                    Penulis
                  </label>
                  <Input id="penulis" name="penulis" value={formData.penulis} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="gambar" className="text-sm font-medium">
                  Gambar Cover
                </label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  defaultImageUrl={formData.gambar_url}
                  bucket="uploads"
                  folder="general"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {selectedPost ? "Simpan Perubahan" : "Publikasikan Artikel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus artikel "{selectedPost?.judul}" secara permanen dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}

