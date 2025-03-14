"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Home, Award, Users } from "lucide-react"

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const features = [
    {
      icon: <Home className="h-10 w-10 text-primary" />,
      title: "Properti Berkualitas",
      description: "Kami hanya menawarkan properti dengan kualitas terbaik dan lokasi strategis.",
    },
    {
      icon: <Award className="h-10 w-10 text-secondary" />,
      title: "Terpercaya",
      description: "Lebih dari 10 tahun pengalaman dalam industri properti dengan ribuan klien puas.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Tim Profesional",
      description: "Tim kami terdiri dari para profesional berpengalaman yang siap membantu Anda.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Tentang Kami
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={isInView ? { opacity: 1, width: "80px" } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-primary mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Brick Property adalah perusahaan properti terkemuka yang berfokus pada kualitas dan kepuasan pelanggan. Kami
            berkomitmen untuk membantu Anda menemukan properti impian.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6">Mengapa Memilih Kami?</h3>
            <ul className="space-y-4">
              {[
                "Properti berkualitas dengan lokasi strategis",
                "Proses pembelian yang mudah dan transparan",
                "Dukungan penuh dari tim profesional kami",
                "Harga kompetitif dengan nilai investasi tinggi",
                "Layanan purna jual yang memuaskan",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <Check className="h-6 w-6 text-primary mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-md flex items-start"
              >
                <div className="mr-4 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

