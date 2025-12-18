"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, Award, Lock, Unlock, Gift, Zap, Loader2 } from "lucide-react"

interface StatsData {
  totalSpent: number
  completedOrders: number
  totalOrders: number
  loyaltyPoints: number
  savedAmount: number
  requiredForDiscount: number
  discountUnlocked: boolean
  progressPercentage: number
  remainingAmount: number
}

interface ProfileStatsProps {
  stats: StatsData | null
  loading: boolean
}

export default function ProfileStats({ stats, loading }: ProfileStatsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    totalSpent: 0,
    completedOrders: 0,
    loyaltyPoints: 0,
    savedAmount: 0,
  })

  useEffect(() => {
    if (!stats) return

    const duration = 1500
    const steps = 40
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedValues({
        totalSpent: Math.floor(stats.totalSpent * progress),
        completedOrders: Math.floor(stats.completedOrders * progress),
        loyaltyPoints: Math.floor(stats.loyaltyPoints * progress),
        savedAmount: Math.floor(stats.savedAmount * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedValues({
          totalSpent: stats.totalSpent,
          completedOrders: stats.completedOrders,
          loyaltyPoints: stats.loyaltyPoints,
          savedAmount: stats.savedAmount,
        })
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [stats])

  if (loading) {
    return (
      <div className="mb-4 xs:mb-6 sm:mb-8">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const statsCards = [
    {
      title: "إجمالي المشتريات",
      value: animatedValues.totalSpent,
      unit: "جنيه",
      icon: TrendingUp,
      bgGradient: "from-emerald-500 to-teal-600",
      progress: stats.progressPercentage,
      subtitle: stats.discountUnlocked
        ? "تم فتح بطاقات الخصم!"
        : `${stats.remainingAmount} جنيه إضافي لفتح بطاقات الخصم`,
    },
    {
      title: "الطلبات المكتملة",
      value: animatedValues.completedOrders,
      unit: `من ${stats.totalOrders} طلب`,
      icon: Package,
      bgGradient: "from-blue-500 to-indigo-600",
      progress: stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0,
      subtitle: stats.totalOrders > 0 ? "نسبة الطلبات المكتملة" : "لا توجد طلبات بعد",
    },
    {
      title: "نقاط المكافآت",
      value: animatedValues.loyaltyPoints,
      unit: "نقطة",
      icon: Zap,
      bgGradient: "from-purple-500 to-pink-600",
      progress: Math.min((stats.loyaltyPoints / 5000) * 100, 100),
      subtitle: "نقطة لكل 10 جنيه مشتريات",
    },
    {
      title: "إجمالي الوفورات",
      value: animatedValues.savedAmount,
      unit: "جنيه",
      icon: Award,
      bgGradient: "from-green-500 to-emerald-600",
      progress: stats.totalSpent > 0 ? (stats.savedAmount / stats.totalSpent) * 100 : 0,
      subtitle: "وفرت من خلال الخصومات",
    },
  ]

  return (
    <div className="mb-4 xs:mb-6 sm:mb-8 space-y-4 xs:space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardContent className="p-4 xs:p-6">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 xs:mb-4 gap-3">
            <div className="flex items-center gap-2 xs:gap-3">
              {stats.discountUnlocked ? (
                <div className="w-10 xs:w-12 h-10 xs:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Unlock className="w-5 xs:w-6 h-5 xs:h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-10 xs:w-12 h-10 xs:h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Lock className="w-5 xs:w-6 h-5 xs:h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-base xs:text-lg font-semibold text-gray-900">
                  {stats.discountUnlocked ? "بطاقات الخصم مفتوحة!" : "بطاقات الخصم مقفلة"}
                </h3>
                <p className="text-xs xs:text-sm text-gray-600">
                  {stats.discountUnlocked
                    ? "يمكنك استخدام بطاقات الخصم المتاحة"
                    : `أنفق ${stats.remainingAmount} جنيه إضافي لفتح بطاقات الخصم`}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/50 text-sm xs:text-base">
              {Math.round(stats.progressPercentage)}%
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress value={stats.progressPercentage} className="h-2.5 xs:h-3 bg-white/50" />
            <div className="flex justify-between text-xs xs:text-sm text-gray-600">
              <span>{stats.totalSpent.toLocaleString()} جنيه</span>
              <span>{stats.requiredForDiscount.toLocaleString()} جنيه</span>
            </div>
          </div>

          {stats.discountUnlocked && (
            <div className="mt-3 xs:mt-4 p-2.5 xs:p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-1.5 xs:gap-2 text-green-700">
                <Gift className="w-4 xs:w-5 h-4 xs:h-5 shrink-0" />
                <span className="font-medium text-xs xs:text-sm">تهانينا! يمكنك الآن استخدام بطاقات الخصم</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg"
            >
              <CardContent className="p-4 xs:p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3 xs:mb-4">
                  <div
                    className={`w-10 xs:w-12 h-10 xs:h-12 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}
                  >
                    <Icon className="w-5 xs:w-6 h-5 xs:h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs xs:text-sm text-gray-600">{stat.unit}</div>
                  </div>
                </div>

                <div className="space-y-2 xs:space-y-3">
                  <h3 className="font-semibold text-gray-900 text-right text-sm xs:text-base">{stat.title}</h3>

                  <div className="space-y-1.5 xs:space-y-2">
                    <Progress value={stat.progress} className="h-1.5 xs:h-2 bg-gray-100" />
                    <p className="text-[10px] xs:text-xs text-gray-600 text-right leading-relaxed">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
