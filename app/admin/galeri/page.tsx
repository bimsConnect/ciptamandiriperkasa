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
import Image from "next/image"
import ImageUpload from "@/components/ImageUpload"

interface GaleriItem {
  id: number
  judul: string
  lokasi: string
  deskripsi: string | null
  gambar_url: string
  created_at: string
}

export default function GaleriPage() {
  const router = useRouter()
  const [galeriItems, setGaleriItems] = useState<GaleriItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GaleriItem | null>(null)
  const [formData, setFormData] = useState({
    judul: "",
    lokasi: "",
    deskripsi: "",
    gambar_url: "",
  })

  // Fetch data galeri
  const fetchGaleri = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/galeri")
      const data = await response.json()
      setGaleriItems(data.data)
    } catch (error) {
      console.error("Error mengambil data galeri:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGaleri()
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
  const openDialog = (item?: GaleriItem) => {
    if (item) {
      setSelectedItem(item)
      setFormData({
        judul: item.judul,
        lokasi: item.lokasi,
        deskripsi: item.deskripsi || "",
        gambar_url: item.gambar_url,
      })
    } else {
      setSelectedItem(null)
      setFormData({
        judul: "",
        lokasi: "",
        deskripsi: "",
        gambar_url: "",
      })
    }
    setIsDialogOpen(true)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (item: GaleriItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi input
    if (!formData.judul || !formData.lokasi || !formData.gambar_url) {
      alert("Judul, lokasi, dan gambar harus diisi")
      return
    }

    try {
      if (selectedItem) {
        // Update existing item
        await fetch(`/api/galeri/${selectedItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Add new item
        await fetch("/api/galeri", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      // Refresh data and close dialog
      fetchGaleri()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error menyimpan data galeri:", error)
      alert("Terjadi kesalahan saat menyimpan data")
    }
  }

  // Delete item
  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      await fetch(`/api/galeri/${selectedItem.id}`, {
        method: "DELETE",
      })

      // Refresh data and close dialog
      fetchGaleri()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error menghapus data galeri:", error)
      alert("Terjadi kesalahan saat menghapus data")
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Galeri</h1>
            <p className="text-gray-500">Kelola foto properti yang ditampilkan di galeri</p>
          </div>
          <Button onClick={() => openDialog()} className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 material-ripple">
            <Plus className="mr-2 h-4 w-4" /> Tambah Foto Baru
          </Button>
        </div>

        <Card className="material-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Daftar Foto Properti</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : galeriItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada foto properti. Klik tombol "Tambah Foto Baru" untuk menambahkan.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galeriItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="relative h-16 w-24 rounded overflow-hidden">
                          <Image
                            src={item.gambar_url || "/placeholder.svg"}
                            alt={item.judul}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.judul}</TableCell>
                      <TableCell>{item.lokasi}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.deskripsi}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openDialog(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(item)}
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

      {/* Dialog untuk tambah/edit galeri */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Foto Properti" : "Tambah Foto Properti Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="judul" className="text-sm font-medium">
                  Judul Properti
                </label>
                <Input id="judul" name="judul" value={formData.judul} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="lokasi" className="text-sm font-medium">
                  Lokasi
                </label>
                <Input id="lokasi" name="lokasi" value={formData.lokasi} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="deskripsi" className="text-sm font-medium">
                  Deskripsi (Opsional)
                </label>
                <Textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="gambar" className="text-sm font-medium">
                  Gambar Properti
                </label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  defaultImageUrl={formData.gambar_url}
                  bucket="uploads"
                  folder="general"
                />
                {formData.gambar_url && (
                  <p className="text-xs text-gray-500 mt-1">
                    Gambar sudah dipilih. Unggah gambar baru untuk mengganti.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {selectedItem ? "Simpan Perubahan" : "Tambah Foto"}
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
              Tindakan ini akan menghapus foto properti "{selectedItem?.judul}" secara permanen dan tidak dapat
              dibatalkan.
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

