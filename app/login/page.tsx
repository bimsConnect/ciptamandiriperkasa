"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Mountain, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/Alert"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
  
    email: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false);

  // Cek apakah sudah login
useEffect(() => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    setFormData((prev) => ({ ...prev, email: savedEmail }));
    setRememberMe(true);
  }
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    // Verifikasi token
    const verifyToken = async () => {
      try {
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })

          if (!response.ok) {
            throw new Error("Token verification failed")
          }

          const data = await response.json()

          if (data.success) {
            router.push("/admin/dashboard")
          } else {
            localStorage.removeItem("token")
          }
        } catch (error) {
          // Token tidak valid, hapus dari localStorage
          console.error("Token verification error:", error)
          localStorage.removeItem("token")
        }
      }

      verifyToken()
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat login");
      }
      
      // Simpan email jika "Ingat saya" dicentang
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
       
      // Simpan token di localStorage
      localStorage.setItem("token", data.token)

      // Redirect ke dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error login:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="shadow-lg border-none">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center mb-4">
                <Mountain className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold ml-2">
                  <span className="text-primary">Cipta Mandiri</span>
                  <span className="text-secondary"> Perkasa</span>
                </span>
              </div>
              <CardTitle className="text-2xl text-center font-bold">Admin Login</CardTitle>
              <CardDescription className="text-center text-base">
                Masukkan kredensial Anda untuk mengakses dashboard admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-primary"
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-primary"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Ingat saya
                    </label>
                  </div>
                  <Link href="#" className="text-sm text-primary hover:underline font-medium">
                    Lupa password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Sedang login...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-100">
                <p className="font-medium mb-1">Kredensial Default:</p>
                <div className="grid grid-cols-[80px_1fr] gap-1">
                  <span className="font-medium">Email:</span>
                  <span>: admin@percobaan.com</span>
                  <span className="font-medium">Password:</span>
                  <span>: admin123</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6 pt-2">
              <p className="text-sm text-gray-600">
                Tidak punya akun?{" "}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Hubungi administrator
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Right side - Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block"
        >
          <div className="relative h-[550px] w-full rounded-xl overflow-hidden shadow-lg">
            <Image src="/?height=1000&width=800" alt="Login" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent flex flex-col justify-center p-10">
              <h2 className="text-3xl font-bold text-white mb-6">Selamat Datang Kembali!</h2>
              <p className="text-white/90 max-w-xs text-lg leading-relaxed">
                Akses dashboard admin Anda untuk mengelola properti, klien, dan lainnya dengan mudah dan efisien.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

