import { createClient } from "@supabase/supabase-js"

// Pastikan environment variables tersedia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Buat Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fungsi untuk upload gambar ke Supabase Storage
export async function uploadImage(file: File, bucket = "uploads", folder = "general") {
  try {
    // Buat nama file unik dengan timestamp
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}.${fileExt}`

    // Upload file ke bucket yang ditentukan
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Dapatkan URL publik dari file yang diupload
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

