"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Package, Truck, ShieldCheck } from "lucide-react"
import { useState } from "react"

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

interface ProductDetailsModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onAddToCart?: (product: Product) => void
}

export default function ProductDetailsModal({ product, open, onClose, onAddToCart }: ProductDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const handleAddToCart = async () => {
    if (!product.inStock || !onAddToCart) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product)
      }
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const discountPercentage = product.discount || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <img
                src={product.image || "/placeholder.svg?height=400&width=400&query=medicine"}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
              />

              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                {discountPercentage > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-3 py-1 font-bold rounded-md shadow-lg">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs px-3 py-1 font-bold rounded-md shadow-lg">
                    الأكثر مبيعاً
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-xs px-3 py-1 font-bold rounded-md shadow-lg">
                    جديد
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-lg">
                  <Badge className="bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-lg">غير متوفر</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <DialogHeader className="space-y-3 mb-4">
              {/* Category */}
              <div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  {product.category}
                </Badge>
              </div>

              {/* Product Name */}
              <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight text-right">
                {product.name}
              </DialogTitle>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} تقييم)
                </span>
              </div>
            </DialogHeader>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">وصف المنتج</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Package className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-gray-600">منتج أصلي</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-gray-600">توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-gray-600">ضمان الجودة</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-emerald-600">{product.price}</span>
                <span className="text-lg text-gray-500">ج.م</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">{product.originalPrice} ج.م</span>
                )}
              </div>
              {discountPercentage > 0 && (
                <p className="text-sm text-red-600 font-medium">
                  وفر {product.originalPrice ? product.originalPrice - product.price : 0} ج.م
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 mb-2 block">الكمية</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-lg"
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[3ch] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="h-10 w-10 rounded-lg"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isLoading}
                className={`w-full rounded-lg text-base py-6 font-semibold transition-all duration-300 ${
                  product.inStock
                    ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الإضافة</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.inStock ? "أضف للسلة" : "غير متوفر"}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
