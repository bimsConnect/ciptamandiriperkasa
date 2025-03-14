"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Facebook, Twitter, Instagram, Linkedin, Send, Mountain } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Link href="/" className="flex items-center">
              <Mountain className="h-8 w-8 text-secondary mr-2" />
              <span className="text-2xl font-bold">
                <span className="text-primary">Cipta Mandiri</span>
                <span className="text-secondary"> Perkasa</span>
              </span>
            </Link>
            <p className="text-gray-400">
            Cipta Mandiri Perkasa adalah spesialis pembuatan kubah GRC, ornamen, masjid, kerawangan, menara, dan motif awan kaligrafi. Dengan pengalaman lebih dari 15 tahun, kami berkomitmen untuk memberikan layanan terbaik.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Link Cepat</h3>
            <ul className="space-y-2">
              {[
                { name: "Beranda", href: "/" },
                { name: "Tentang Kami", href: "#about" },
                { name: "Properti", href: "#gallery" },
                { name: "Blog", href: "#blog" },
                { name: "Kontak", href: "#contact" },
                { name: "Testimoni", href: "#testimonials" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Layanan Kami</h3>
            <ul className="space-y-2">
              {[
                "Pembuatan Kubah GRC",
                "Pembuatan Ornamen",
                "Pembuatan Masjid",
                "Pembuatan Mimbar",
                "Pembuatan Kerawangan",
                "Pembuatan Menara",
                "Pembuatan Awan Masjid",
              ].map((service) => (
                <li key={service}>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Berlangganan Newsletter</h3>
            <p className="text-gray-400">Dapatkan informasi terbaru tentang properti dan penawaran eksklusif</p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Email Anda" className="bg-gray-800 border-gray-700 text-white" />
              {/* ganti dengan email anda nanti  */}
              <Button className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {currentYear} Cipta Mandiri Perkasa. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-primary text-sm">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-gray-400 hover:text-primary text-sm">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

