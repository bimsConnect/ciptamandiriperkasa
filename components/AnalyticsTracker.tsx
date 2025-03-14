"use client"

import { useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export default function AnalyticsTracker() {
  useEffect(() => {
    // Fungsi untuk mendapatkan atau membuat session ID
    const getSessionId = () => {
      let sessionId = localStorage.getItem("session_id")

      if (!sessionId) {
        sessionId = uuidv4()
        localStorage.setItem("session_id", sessionId)
      }

      return sessionId
    }

    // Fungsi untuk merekam kunjungan
    const recordVisit = async () => {
      try {
        const sessionId = getSessionId()
        const currentPath = window.location.pathname
        const referrer = document.referrer

        await fetch("/api/analitik", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            halaman: currentPath,
            referrer: referrer,
          }),
        })
      } catch (error) {
        console.error("Error merekam kunjungan:", error)
      }
    }

    // Rekam kunjungan saat komponen dimuat
    recordVisit()

    // Rekam kunjungan saat halaman berubah (untuk SPA)
    const handleRouteChange = () => {
      recordVisit()
    }

    // Tambahkan event listener untuk perubahan rute
    window.addEventListener("popstate", handleRouteChange)

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Komponen ini tidak merender apa pun
  return null
}

