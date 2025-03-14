"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { uploadImage } from "@/lib/supabase"
import { Image, Upload, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  defaultImageUrl?: string
  bucket?: string
  folder?: string
  className?: string
}

export default function ImageUpload({
  onImageUploaded,
  defaultImageUrl = "",
  bucket = "uploads",
  folder = "general",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImageUrl)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.")
      return
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.")
      return
    }

    setError(null)
    setIsUploading(true)

    // Buat preview sementara
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      console.log("Uploading image to Supabase...")

      // Upload ke Supabase
      const imageUrl = await uploadImage(file, bucket, folder)

      if (!imageUrl) {
        throw new Error("URL gambar kosong setelah upload.")
      }

      console.log("Image uploaded successfully:", imageUrl)
      onImageUploaded(imageUrl)

      // Hapus URL objek sementara setelah upload berhasil
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error("Error uploading:", err)
      setError("Gagal mengunggah gambar. Silakan coba lagi.")
      setPreviewUrl(defaultImageUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <div className="relative flex-1">
          <Input
            readOnly
            value={previewUrl ? "Gambar telah dipilih" : "Pilih gambar..."}
            className="pr-10 cursor-pointer"
            onClick={handleButtonClick}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </Button>
        </div>

        <Button type="button" variant="outline" size="icon" onClick={handleButtonClick} disabled={isUploading}>
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {previewUrl && (
        <div className="relative mt-2 rounded-md overflow-hidden border border-gray-200">
          <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-40 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
