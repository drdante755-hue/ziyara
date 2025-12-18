"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import {
  FlaskConical,
  Baby,
  Sparkles,
  Zap,
  Shield,
  Pill,
  Heart,
  Stethoscope,
  Syringe,
  Thermometer,
  Eye,
  Bone,
  Brain,
  Droplet,
  Leaf,
  Apple,
} from "lucide-react"

interface Category {
  id: string
  _id: string
  name: string
  slug: string
  color: string
  icon: string
  description?: string
  productCount: number
}

const iconMap: Record<string, React.ElementType> = {
  Pill: Pill,
  Shield: Shield,
  Sparkles: Sparkles,
  Baby: Baby,
  FlaskConical: FlaskConical,
  Zap: Zap,
  Heart: Heart,
  Stethoscope: Stethoscope,
  Syringe: Syringe,
  Thermometer: Thermometer,
  Eye: Eye,
  Bone: Bone,
  Brain: Brain,
  Droplet: Droplet,
  Leaf: Leaf,
  Apple: Apple,
}

const getColorClasses = (hexColor: string) => {
  const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
    "#10b981": { bg: "bg-emerald-100", icon: "text-emerald-600", hover: "group-hover:bg-emerald-200" },
    "#3b82f6": { bg: "bg-blue-100", icon: "text-blue-600", hover: "group-hover:bg-blue-200" },
    "#8b5cf6": { bg: "bg-violet-100", icon: "text-violet-600", hover: "group-hover:bg-violet-200" },
    "#22c55e": { bg: "bg-green-100", icon: "text-green-600", hover: "group-hover:bg-green-200" },
    "#ec4899": { bg: "bg-pink-100", icon: "text-pink-600", hover: "group-hover:bg-pink-200" },
    "#eab308": { bg: "bg-amber-100", icon: "text-amber-600", hover: "group-hover:bg-amber-200" },
    "#f97316": { bg: "bg-orange-100", icon: "text-orange-600", hover: "group-hover:bg-orange-200" },
    "#ef4444": { bg: "bg-red-100", icon: "text-red-600", hover: "group-hover:bg-red-200" },
    "#06b6d4": { bg: "bg-cyan-100", icon: "text-cyan-600", hover: "group-hover:bg-cyan-200" },
    "#6366f1": { bg: "bg-indigo-100", icon: "text-indigo-600", hover: "group-hover:bg-indigo-200" },
  }
  return (
    colorMap[hexColor.toLowerCase()] || {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      hover: "group-hover:bg-emerald-200",
    }
  )
}

export default function CategoryCards() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/categories/public")
        const data = await response.json()

        if (data.success) {
          setCategories(data.data)
        } else {
          setError(data.error || "فشل في جلب الأقسام")
        }
      } catch (err) {
        setError("حدث خطأ في الاتصال بالخادم")
        console.error("Error fetching categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (category: Category) => {
    const slug = category.slug
    if (slug && slug !== "undefined") {
      router.push(`/user/products/${encodeURIComponent(slug)}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 xs:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">تصفح الأقسام</h2>
            </div>
            <p className="text-gray-500 text-xs xs:text-sm">اكتشف منتجاتنا حسب الفئة</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 xs:p-4 flex items-center gap-3 xs:gap-4">
                <Skeleton className="w-12 xs:w-14 h-12 xs:h-14 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 xs:h-4 w-20 xs:w-24 mb-2" />
                  <Skeleton className="h-2.5 xs:h-3 w-12 xs:w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">لا توجد فئات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 xs:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">تصفح الأقسام</h2>
          </div>
          <p className="text-gray-500 text-xs xs:text-sm">اكتشف منتجاتنا حسب الفئة</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-4">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || Pill
          const colorClasses = getColorClasses(category.color)

          return (
            <Card
              key={category._id}
              className="group cursor-pointer border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden touch-manipulation"
              onClick={() => handleCategoryClick(category)}
            >
              <CardContent className="p-3 xs:p-4 flex items-center gap-3 xs:gap-4 min-h-[80px]">
                <div
                  className={`w-12 xs:w-14 h-12 xs:h-14 ${colorClasses.bg} ${colorClasses.hover} rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300`}
                >
                  <IconComponent className={`w-6 xs:w-7 h-6 xs:h-7 ${colorClasses.icon}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xs xs:text-sm mb-1 truncate">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] xs:text-xs text-gray-500">{category.productCount} منتج</span>
                  </div>
                </div>

                <ArrowLeft className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-[-4px] transition-all duration-300 flex-shrink-0" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
