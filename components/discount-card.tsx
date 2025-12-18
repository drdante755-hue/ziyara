"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ShoppingBag, Percent, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface DiscountCardProps {
  card: {
    id: string
    title: string
    description: string
    discount: number
    validUntil: string
    category: string
    minPurchase: number
    isActive: boolean
    isUsed?: boolean
    usedAt?: string | null
  }
  onUseCard?: (card: any) => void
}

export default function DiscountCard({ card, onUseCard }: DiscountCardProps) {
  const isExpiringSoon = () => {
    const expiryDate = new Date(card.validUntil)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const getStatusColor = () => {
    if (card.isUsed) return "bg-blue-100 text-blue-700"
    if (!card.isActive) return "bg-gray-100 text-gray-600"
    if (isExpiringSoon()) return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  const getStatusIcon = () => {
    if (card.isUsed) return <CheckCircle className="w-4 h-4" />
    if (!card.isActive) return <Clock className="w-4 h-4" />
    if (isExpiringSoon()) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (card.isUsed) return "تم الاستخدام"
    if (!card.isActive) return "منتهي الصلاحية"
    if (isExpiringSoon()) return "ينتهي قريباً"
    return "نشط"
  }

  const handleUseCard = () => {
    // لا يمكن استخدام البطاقة إذا كانت مستخدمة بالفعل
    if (card.isUsed) {
      return
    }

    if (onUseCard) {
      onUseCard(card)
    } else {
      // Default behavior: redirect to checkout with the card
      window.location.href = `/checkout?discountCard=${card.id}`
    }
  }

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        card.isUsed
          ? "ring-2 ring-blue-200 bg-blue-50/50"
          : card.isActive
            ? "ring-2 ring-emerald-200 bg-white"
            : "bg-gray-50 opacity-75"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge className={`${getStatusColor()} border-0 flex items-center gap-1`}>
            {getStatusIcon()}
            {getStatusText()}
          </Badge>

          <div className="text-left">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <div className="text-center">
                <div className="text-xl font-bold text-white leading-none">{card.discount}%</div>
                <div className="text-xs text-white/80 leading-none">خصم</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الفئة:</span>
              <Badge variant="outline" className="text-xs">
                {card.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">الحد الأدنى:</span>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{card.minPurchase} جنيه</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">ينتهي في:</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{new Date(card.validUntil).toLocaleDateString("ar-EG")}</span>
              </div>
            </div>

            {card.isUsed && card.usedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">تم الاستخدام:</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">{new Date(card.usedAt).toLocaleDateString("ar-EG")}</span>
                </div>
              </div>
            )}
          </div>

          {card.isActive && !card.isUsed && (
            <Button
              onClick={handleUseCard}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
            >
              <Percent className="w-4 h-4 ml-2" />
              استخدام البطاقة
            </Button>
          )}

          {card.isUsed && (
            <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">تم استخدام هذه البطاقة</span>
              </div>
              {card.usedAt && (
                <span className="text-xs text-blue-600">في {new Date(card.usedAt).toLocaleDateString("ar-EG")}</span>
              )}
            </div>
          )}

          {!card.isActive && !card.isUsed && (
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">هذه البطاقة غير متاحة حالياً</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
