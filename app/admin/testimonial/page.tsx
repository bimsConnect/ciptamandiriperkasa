"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/Admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
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
import { Badge } from "@/components/ui/Badge"
import { CheckCircle, XCircle, Clock, Trash2, Star, StarHalf } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Testimonial {
  id: number
  nama: string
  peran: string | null
  pesan: string
  rating: number
  gambar_url: string | null
  status: "disetujui" | "ditolak" | "menunggu"
  created_at: string
}

export default function TestimonialPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("semua")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/testimonial")
      const data = await response.json()
      setTestimonials(data.data)
      filterTestimonials(data.data, activeTab)
    } catch (error) {
      console.error("Error mengambil data testimonial:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  // Filter testimonials based on active tab
  const filterTestimonials = (data: Testimonial[], status: string) => {
    if (status === "semua") {
      setFilteredTestimonials(data)
    } else {
      setFilteredTestimonials(data.filter((item) => item.status === status))
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    filterTestimonials(testimonials, value)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setIsDeleteDialogOpen(true)
  }

  // Update testimonial status
  const updateStatus = async (id: number, status: "disetujui" | "ditolak" | "menunggu") => {
    try {
      await fetch(`/api/testimonial/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      // Refresh data
      fetchTestimonials()
    } catch (error) {
      console.error("Error mengupdate status testimonial:", error)
    }
  }

  // Delete testimonial
  const handleDelete = async () => {
    if (!selectedTestimonial) return

    try {
      await fetch(`/api/testimonial/${selectedTestimonial.id}`, {
        method: "DELETE",
      })

      // Refresh data and close dialog
      fetchTestimonials()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error menghapus testimonial:", error)
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

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    return <div className="flex">{stars}</div>
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disetujui":
        return <Badge className="bg-green-500">Disetujui</Badge>
      case "ditolak":
        return <Badge className="bg-red-500">Ditolak</Badge>
      case "menunggu":
        return <Badge className="bg-yellow-500">Menunggu</Badge>
      default:
        return null
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Testimonial</h1>
            <p className="text-gray-500">Kelola testimonial dari pengguna website</p>
          </div>
        </div>

        <Tabs defaultValue="semua" onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="semua">Semua</TabsTrigger>
            <TabsTrigger value="menunggu">Menunggu</TabsTrigger>
            <TabsTrigger value="disetujui">Disetujui</TabsTrigger>
            <TabsTrigger value="ditolak">Ditolak</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="material-card border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Daftar Testimonial{" "}
                  {activeTab !== "semua" ? `- ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Memuat data...</div>
                ) : filteredTestimonials.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada testimonial {activeTab !== "semua" ? `dengan status ${activeTab}` : ""}.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Pesan</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTestimonials.map((testimonial) => (
                        <TableRow key={testimonial.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {testimonial.gambar_url ? (
                                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                  <Image
                                    src={testimonial.gambar_url || "/placeholder.svg"}
                                    alt={testimonial.nama}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">
                                    {testimonial.nama.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{testimonial.nama}</div>
                                {testimonial.peran && <div className="text-xs text-gray-500">{testimonial.peran}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{testimonial.pesan}</TableCell>
                          <TableCell>{renderStars(testimonial.rating)}</TableCell>
                          <TableCell>{formatDate(testimonial.created_at)}</TableCell>
                          <TableCell>{getStatusBadge(testimonial.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {testimonial.status !== "disetujui" && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => updateStatus(testimonial.id, "disetujui")}
                                  title="Setujui"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {testimonial.status !== "ditolak" && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => updateStatus(testimonial.id, "ditolak")}
                                  title="Tolak"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {testimonial.status !== "menunggu" && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-yellow-500 hover:text-yellow-700"
                                  onClick={() => updateStatus(testimonial.id, "menunggu")}
                                  title="Tandai Menunggu"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => openDeleteDialog(testimonial)}
                                title="Hapus"
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus testimonial dari "{selectedTestimonial?.nama}" secara permanen dan tidak dapat
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

