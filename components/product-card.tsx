"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  category: string
  inStock: boolean
  discount?: number
  isBestseller?: boolean
  isNew?: boolean
  description?: string
  type?: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.inStock || !onAddToCart) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      onAddToCart(product)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProduct = () => {
    router.push(`/user/products/${product.category}?product=${product.id}`)
  }

  const discountPercentage = product.discount || 0

  return (
    <Card
      className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 touch-manipulation">
        <img
          src={product.image || "/placeholder.svg?height=200&width=200&query=medicine"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges - Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-md shadow-sm">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-md shadow-sm">
              الأكثر مبيعاً
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-md shadow-sm">
              جديد
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <Badge className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg">غير متوفر</Badge>
          </div>
        )}

        {/* Quick View Button - Shows on Hover */}
        <div
          className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${isHovered && product.inStock ? "opacity-100" : "opacity-0"}`}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white text-gray-900 rounded-full px-4 shadow-lg"
            onClick={handleViewProduct}
          >
            <Eye className="w-4 h-4 ml-1.5" />
            عرض
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-2.5 xs:p-3 sm:p-4">
        {/* Category */}
        <div className="mb-1.5 sm:mb-2">
          <span className="text-[9px] xs:text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 xs:px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-xs xs:text-sm leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 xs:w-3 h-2.5 xs:h-3 ${
                  i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] xs:text-[10px] text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-base xs:text-lg font-bold text-emerald-600">{product.price}</span>
          <span className="text-[10px] xs:text-xs text-gray-500">ج.م</span>
          {product.originalPrice && (
            <span className="text-[10px] xs:text-xs text-gray-400 line-through mr-auto">
              {product.originalPrice} ج.م
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isLoading}
          className={`w-full rounded-lg text-xs xs:text-sm py-2.5 sm:py-3 font-medium transition-all duration-300 min-h-[44px] touch-manipulation ${
            product.inStock
              ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <div className="w-3.5 xs:w-4 h-3.5 xs:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري الإضافة</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <ShoppingCart className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
              <span>{product.inStock ? "أضف للسلة" : "غير متوفر"}</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
