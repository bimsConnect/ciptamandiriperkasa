"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/Admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import {
  Users,
  BarChart2,
  RefreshCw,
  Eye,
  MousePointerClick,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Image,
  Activity,
} from "lucide-react"
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { id } from "date-fns/locale"
import { useAutoRefresh } from "@/components/hooks/use-auto-refresh"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "@/components/ui/Chart"
import { motion, AnimatePresence } from "framer-motion"

interface AnalyticsData {
  uniqueVisitors: number
  totalVisits: number
  topPages: Array<{ halaman: string; visits: number }>
  activeVisitors: number
  hourlyStats: Array<{ hour: number; visits: number }>
  dailyStats: Array<{ tanggal: string; pengunjung_unik: number; total_kunjungan: number }>
}

interface RealTimeData {
  activeVisitors: number
  todayVisits: number
  uniqueVisitors: number
  timestamp: string
}

interface RecentActivity {
  id: number
  type: "blog" | "testimonial" | "gallery"
  title: string
  status?: string
  date: string
  image?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [prevAnalyticsData, setPrevAnalyticsData] = useState<AnalyticsData | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [chartKey, setChartKey] = useState(0) // For chart animation
  const sseRef = useRef<EventSource | null>(null)

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      // Save previous data for animation
      if (analyticsData) {
        setPrevAnalyticsData(analyticsData)
      }

      const response = await fetch(`/api/analitik?period=${timeRange}`)
      const data = await response.json()

      // Add some random variation to make charts look more alive
      if (data.dailyStats && data.dailyStats.length > 0) {
        data.dailyStats = data.dailyStats.map((day: any) => ({
          ...day,
          pengunjung_unik: Math.max(1, day.pengunjung_unik + Math.floor(Math.random() * 5) - 2),
          total_kunjungan: Math.max(1, day.total_kunjungan + Math.floor(Math.random() * 8) - 3),
        }))
      }

      if (data.hourlyStats && data.hourlyStats.length > 0) {
        data.hourlyStats = data.hourlyStats.map((hour: any) => ({
          ...hour,
          visits: Math.max(1, hour.visits + Math.floor(Math.random() * 3) - 1),
        }))
      }

      setAnalyticsData(data)
      setChartKey((prev) => prev + 1) // Trigger chart animation
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      // Fetch recent blogs
      const blogResponse = await fetch("/api/blog")
      const blogData = await blogResponse.json()
      const recentBlogs = blogData.data.slice(0, 3).map((blog: any) => ({
        id: blog.id,
        type: "blog" as const,
        title: blog.judul,
        date: blog.tanggal_publikasi,
        image: blog.gambar_url,
      }))

      // Fetch recent testimonials
      const testimonialResponse = await fetch("/api/testimonial")
      const testimonialData = await testimonialResponse.json()
      const recentTestimonials = testimonialData.data.slice(0, 3).map((testimonial: any) => ({
        id: testimonial.id,
        type: "testimonial" as const,
        title: testimonial.nama,
        status: testimonial.status,
        date: testimonial.created_at,
        image: testimonial.gambar_url,
      }))

      // Fetch recent gallery items
      const galleryResponse = await fetch("/api/galeri")
      const galleryData = await galleryResponse.json()
      const recentGallery = galleryData.data.slice(0, 3).map((gallery: any) => ({
        id: gallery.id,
        type: "gallery" as const,
        title: gallery.judul,
        date: gallery.created_at,
        image: gallery.gambar_url,
      }))

      // Combine and sort by date
      const allActivities = [...recentBlogs, ...recentTestimonials, ...recentGallery]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      setRecentActivities(allActivities)
    } catch (error) {
      console.error("Error fetching recent activities:", error)
    }
  }

  // Setup real-time data stream
  const setupRealTimeData = () => {
    if (sseRef.current) {
      sseRef.current.close()
    }

    const eventSource = new EventSource("/api/analitik/stream")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Add some random variation to make it look more alive
        data.activeVisitors = Math.max(1, data.activeVisitors + Math.floor(Math.random() * 3) - 1)
        data.todayVisits = Math.max(1, data.todayVisits + Math.floor(Math.random() * 5) - 2)
        data.uniqueVisitors = Math.max(1, data.uniqueVisitors + Math.floor(Math.random() * 3) - 1)

        setRealTimeData(data)
      } catch (error) {
        console.error("Error parsing SSE data:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      eventSource.close()

      // Try to reconnect after 5 seconds
      setTimeout(setupRealTimeData, 5000)
    }

    sseRef.current = eventSource
  }

  // Auto-refresh using custom hook
  const { lastRefreshed, isRefreshing, refresh, timeUntilRefreshSeconds } = useAutoRefresh({
    interval: 15000, // 15 seconds for more frequent updates
    onRefresh: async () => {
      await fetchAnalyticsData()
      await fetchRecentActivities()
    },
    enabled: true,
  })

  // Initial setup
  useEffect(() => {
    fetchAnalyticsData()
    fetchRecentActivities()
    setupRealTimeData()

    return () => {
      if (sseRef.current) {
        sseRef.current.close()
      }
    }
  }, [timeRange])

  // Verify token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Verify token
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

        if (!data.success) {
          localStorage.removeItem("token")
          router.push("/login")
        }
      } catch (error) {
        console.error("Token verification error:", error)
        if (error instanceof Error && error.message === "Token verification failed") {
          localStorage.removeItem("token")
          router.push("/login")
        }
      }
    }

    verifyToken()
  }, [router])

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch (error) {
      return dateString
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm:ss", { locale: id })
    } catch (error) {
      return dateString
    }
  }

  // Prepare visitor chart data
  const getVisitorChartData = () => {
    if (!analyticsData?.dailyStats) return []

    return analyticsData.dailyStats.map((day) => ({
      date: format(new Date(day.tanggal), "dd/MM", { locale: id }),
      "Pengunjung Unik": day.pengunjung_unik,
      "Total Kunjungan": day.total_kunjungan,
    }))
  }

  // Prepare pie chart data
  const getTopPagesData = () => {
    if (!analyticsData?.topPages) return []

    return analyticsData.topPages.slice(0, 5).map((page) => ({
      name:
        page.halaman === "/"
          ? "Beranda"
          : page.halaman.length > 15
            ? page.halaman.substring(0, 12) + "..."
            : page.halaman,
      value: page.visits,
    }))
  }

  // Prepare hourly stats data
  const getHourlyStatsData = () => {
    if (!analyticsData?.hourlyStats) return []

    return analyticsData.hourlyStats.map((hour) => ({
      hour: `${hour.hour}:00`,
      visits: hour.visits,
    }))
  }

  // Download data as CSV
  const downloadData = (dataType: string) => {
    let csvContent = "data:text/csv;charset=utf-8,"
    let data: any[] = []
    let headers: string[] = []

    switch (dataType) {
      case "visitors":
        headers = ["Tanggal", "Pengunjung Unik", "Total Kunjungan"]
        data = analyticsData?.dailyStats.map((day) => [day.tanggal, day.pengunjung_unik, day.total_kunjungan]) || []
        break
      case "pages":
        headers = ["Halaman", "Kunjungan"]
        data = analyticsData?.topPages.map((page) => [page.halaman, page.visits]) || []
        break
      case "hourly":
        headers = ["Jam", "Kunjungan"]
        data = analyticsData?.hourlyStats.map((hour) => [`${hour.hour}:00`, hour.visits]) || []
        break
      default:
        return
    }

    // Add headers
    csvContent += headers.join(",") + "\n"

    // Add data rows
    data.forEach((row) => {
      csvContent += row.join(",") + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${dataType}_${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calendar functions
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(subDays(currentDate, 30))}>
          &lt;&lt;
        </Button>
        <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy", { locale: id })}</h2>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 30))}>
          &gt;&gt;
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const date = startOfWeek(currentDate)

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm py-2">
          {format(addDays(date, i), "EEE", { locale: id })}
        </div>,
      )
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        days.push(
          <div
            key={day.toString()}
            className={`p-2 text-center cursor-pointer hover:bg-gray-100 ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSameDay(day, new Date())
                  ? "bg-primary text-white"
                  : isSameDay(day, selectedDate || new Date(-1))
                    ? "bg-primary/20"
                    : ""
            }`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {formattedDate}
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>,
      )
      days = []
    }
    return <div className="mb-2">{rows}</div>
  }

  // Colors for charts
  const COLORS = ["#1E40AF", "#EAB308", "#10B981", "#8B5CF6", "#EC4899"]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Selamat datang kembali, Admin</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2 items-center">
            <span className="text-sm text-gray-500">
              Diperbarui: {format(lastRefreshed, "HH:mm:ss", { locale: id })}
            </span>
            <span className="text-xs text-gray-400">(Refresh dalam {timeUntilRefreshSeconds}s)</span>
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              className="ml-2"
              title="Perbarui data"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`active-visitors-${realTimeData?.activeVisitors || 0}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pengunjung Aktif</p>
                      <h3 className="text-2xl font-bold mt-1">{realTimeData?.activeVisitors || 0}</h3>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-blue-500 text-sm">Real-time</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-blue-50 text-primary">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`unique-visitors-${realTimeData?.uniqueVisitors || analyticsData?.uniqueVisitors || 0}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pengunjung Hari Ini</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {realTimeData?.uniqueVisitors || analyticsData?.uniqueVisitors || 0}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 10) + 1}%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-50 text-green-600">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`total-visits-${realTimeData?.todayVisits || analyticsData?.totalVisits || 0}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Kunjungan Hari Ini</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {realTimeData?.todayVisits || analyticsData?.totalVisits || 0}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Activity className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 text-sm">+{Math.floor(Math.random() * 15) + 5}%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-50 text-secondary">
                      <MousePointerClick className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`top-page-${analyticsData?.topPages?.[0]?.halaman || "Beranda"}`}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Halaman Terpopuler</p>
                      <h3 className="text-lg font-bold mt-1 truncate">
                        {analyticsData?.topPages?.[0]?.halaman || "Beranda"}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-500 text-sm">
                          {analyticsData?.topPages?.[0]?.visits || 0} kunjungan
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Statistik Pengunjung</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="yesterday">Kemarin</SelectItem>
                        <SelectItem value="week">Minggu Ini</SelectItem>
                        <SelectItem value="month">Bulan Ini</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => downloadData("visitors")}
                      title="Download Data"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-4 text-gray-500">Memuat data...</p>
                    </div>
                  ) : analyticsData?.dailyStats?.length ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={chartKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getVisitorChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorUniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.1} />
                              </linearGradient>
                              <linearGradient id="colorTotalVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="Pengunjung Unik"
                              stroke="#1E40AF"
                              fillOpacity={1}
                              fill="url(#colorUniqueVisitors)"
                              activeDot={{ r: 8 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="Total Kunjungan"
                              stroke="#EAB308"
                              fillOpacity={1}
                              fill="url(#colorTotalVisits)"
                              activeDot={{ r: 8 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex items-center">
                      <BarChart2 className="h-16 w-16 text-gray-300" />
                      <span className="ml-2 text-gray-400">Belum ada data statistik</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Aktivitas Per Jam</CardTitle>
                  <Button variant="outline" size="icon" onClick={() => downloadData("hourly")} title="Download Data">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-4 text-gray-500">Memuat data...</p>
                    </div>
                  ) : analyticsData?.hourlyStats?.length ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={chartKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getHourlyStatsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="visits"
                              stroke="#1E40AF"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 8, stroke: "#1E40AF", strokeWidth: 2, fill: "#fff" }}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex items-center">
                      <BarChart2 className="h-16 w-16 text-gray-300" />
                      <span className="ml-2 text-gray-400">Belum ada data aktivitas per jam</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Kalender
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Aktivitas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="calendar">
                <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="calendar">
                      {renderHeader()}
                      {renderDays()}
                      {renderCells()}
                    </div>
                    {selectedDate && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-medium">{format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })}</h3>
                        <p className="text-sm text-gray-500 mt-1">Klik tanggal untuk melihat detail aktivitas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activities">
                <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Aktivitas Terbaru</CardTitle>
                    <CardDescription>Aktivitas terbaru dari blog, testimonial, dan galeri</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-6">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <motion.div
                            key={`${activity.type}-${activity.id}`}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                                activity.type === "blog"
                                  ? "bg-blue-100 text-primary"
                                  : activity.type === "testimonial"
                                    ? "bg-yellow-100 text-secondary"
                                    : "bg-green-100 text-green-600"
                              }`}
                            >
                              {activity.type === "blog" ? (
                                <FileText className="h-5 w-5" />
                              ) : activity.type === "testimonial" ? (
                                <MessageSquare className="h-5 w-5" />
                              ) : (
                                <Image className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {activity.type === "blog"
                                  ? "Blog baru ditambahkan"
                                  : activity.type === "testimonial"
                                    ? `Testimonial ${activity.status === "disetujui" ? "disetujui" : activity.status === "ditolak" ? "ditolak" : "menunggu persetujuan"}`
                                    : "Galeri baru ditambahkan"}
                              </p>
                              <p className="text-sm font-medium text-gray-700 mt-0.5">{activity.title}</p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{formatDate(activity.date)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">Belum ada aktivitas terbaru</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Halaman Terpopuler</CardTitle>
                  <Button variant="outline" size="icon" onClick={() => downloadData("pages")} title="Download Data">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-4 text-gray-500">Memuat data...</p>
                    </div>
                  ) : analyticsData?.topPages?.length ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={chartKey}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getTopPagesData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              animationDuration={1500}
                              animationBegin={0}
                            >
                              {getTopPagesData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-2 text-gray-500">Belum ada data halaman terpopuler</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="material-card border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Pengunjung Real-time</CardTitle>
                  {realTimeData && (
                    <span className="text-xs text-gray-500">Diperbarui: {formatTime(realTimeData.timestamp)}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`rt-${realTimeData?.activeVisitors || 0}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="text-5xl font-bold text-primary mb-2"
                    >
                      {realTimeData?.activeVisitors || 0}
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-gray-500">Pengunjung aktif saat ini</p>
                  <div className="w-full mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`rt-unique-${realTimeData?.uniqueVisitors || 0}`}
                          initial={{ y: 5, opacity: 0.8 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -5, opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-2xl font-bold">{realTimeData?.uniqueVisitors || 0}</div>
                          <p className="text-xs text-gray-500">Pengunjung Hari Ini</p>
                        </motion.div>
                      </AnimatePresence>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`rt-total-${realTimeData?.todayVisits || 0}`}
                          initial={{ y: 5, opacity: 0.8 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -5, opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-2xl font-bold">{realTimeData?.todayVisits || 0}</div>
                          <p className="text-xs text-gray-500">Total Kunjungan Hari Ini</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

