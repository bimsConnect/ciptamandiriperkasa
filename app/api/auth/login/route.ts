import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validasi input
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password harus diisi" }, { status: 400 })
    }

    // Cari user berdasarkan email
    const result = await query(
      `
      SELECT * FROM users WHERE email = $1
    `,
      [email],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const user = result.rows[0]

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "rahasia_jwt_default",
      { expiresIn: "1d" },
    )

    // Hapus password dari respons
    delete user.password

    return NextResponse.json(
      {
        success: true,
        user,
        token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error login:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}

