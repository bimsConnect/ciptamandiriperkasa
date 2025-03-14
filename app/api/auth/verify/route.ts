import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 })
    }

    try {
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia_jwt_default") as {
        id: number
        email: string
        role: string
      }

      // Cari user berdasarkan id
      const result = await query(
        `
      SELECT id, username, email, role FROM users WHERE id = $1
    `,
        [decoded.id],
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
      }

      const user = result.rows[0]

      return NextResponse.json(
        {
          success: true,
          user,
        },
        { status: 200 },
      )
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ error: "Token tidak valid", success: false }, { status: 401 })
    }
  } catch (error) {
    console.error("Error verifikasi token:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat verifikasi token", success: false }, { status: 500 })
  }
}

