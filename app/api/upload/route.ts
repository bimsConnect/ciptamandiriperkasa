import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Nonaktifkan body parser bawaan Next.js
  },
};

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const form = new IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        return reject(NextResponse.json({ error: "Gagal memproses file" }, { status: 500 }));
      }

      const file = files.image?.[0];
      if (!file) {
        return reject(NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 }));
      }

      const fileData = fs.readFileSync(file.filepath);
      const fileName = `images/${Date.now()}-${file.originalFilename}`;

      // Upload ke Supabase Storage
      const { data, error } = await supabase.storage
        .from("uploads") // Ganti dengan nama bucket Supabase kamu
        .upload(fileName, fileData, {
          contentType: file.mimetype || "image/jpeg",
        });

      if (error) {
        return reject(NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 }));
      }

      // URL publik gambar yang diupload
      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`;

      resolve(NextResponse.json({ imageUrl }, { status: 200 }));
    });
  });
}
