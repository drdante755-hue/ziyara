"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, User, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActivityLog {
  _id: string
  admin: string
  action: string
  type: "إنشاء" | "تعديل" | "حذف" | "تسجيل دخول" | "أخرى"
  details: string
  target: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("الكل")
  const [filterTarget, setFilterTarget] = useState("الكل")
  const [filterPeriod, setFilterPeriod] = useState("")

  const types = ["الكل", "إنشاء", "تعديل", "حذف", "تسجيل دخول", "أخرى"]
  const targets = ["الكل", "منتج", "خصم", "مستخدم", "إعدادات", "تقييم", "طلب", "قسم", "أخرى"]
  const periods = ["", "اليوم", "أمس", "هذا الأسبوع", "هذا الشهر"]

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (filterType !== "الكل") params.append("type", filterType)
      if (filterTarget !== "الكل") params.append("target", filterTarget)
      if (filterPeriod) params.append("period", filterPeriod)

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      const data = await res.json()

      if (data.logs) {
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, filterType, filterTarget, filterPeriod])

  const getActionIcon = (type: string) => {
    switch (type) {
      case "إنشاء":
        return <Plus className="w-4 h-4" />
      case "تعديل":
        return <Edit className="w-4 h-4" />
      case "حذف":
        return <Trash2 className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "إنشاء":
        return "bg-green-100 text-green-800"
      case "تعديل":
        return "bg-blue-100 text-blue-800"
      case "حذف":
        return "bg-red-100 text-red-800"
      case "تسجيل دخول":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("ar-eg") + " " + date.toLocaleTimeString("ar-eg", { hour: "2-digit", minute: "2-digit" })
    )
  }

  if (loading && logs.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">سجل النشاط</h1>
          <p className="text-gray-600 mt-1">
            تتبع جميع العمليات والتغييرات {pagination && `(${pagination.total} سجل)`}
          </p>
        </div>
        <Button onClick={() => fetchLogs()} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">بحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث في السجل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع العملية</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الهدف</label>
              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {targets.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">الكل</option>
                {periods
                  .filter((p) => p)
                  .map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center text-gray-500">لا توجد سجلات نشاط</CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log._id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(log.type)} text-lg`}
                  >
                    {getActionIcon(log.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{log.action}</h3>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <User className="w-3 h-3 ml-1" />
                        {log.admin}
                      </Badge>
                      <Badge className={getActionColor(log.type)}>{log.type}</Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{log.target}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)}>
            السابق
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            صفحة {pagination.page} من {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchLogs(pagination.page + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}
