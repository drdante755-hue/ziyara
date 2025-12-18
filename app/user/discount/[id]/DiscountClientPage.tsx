"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, AlertCircle, ShoppingBag, Sparkles, Clock, Tag, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SerializedBanner {
  _id: string
  title: string
  imageUrl: string
  discountType?: "percentage" | "fixed"
  discountValue?: number
}

interface SerializedProduct {
  _id: string
  name: string
  nameAr?: string
  price: number
  salePrice?: number
  discount?: number
  images: string[]
  imageUrl?: string
  stock: number
  isActive: boolean
  category: string
}

interface DiscountClientPageProps {
  banner?: SerializedBanner
  products?: SerializedProduct[]
  discountText?: string
  bannerId?: string
  error?: string
}

export default function DiscountClientPage({ banner, products, discountText, error }: DiscountClientPageProps) {
  if (error) {
    let title = "حدث خطأ"
    let description = "عذراً، لا يمكن تحميل هذا العرض حالياً. يرجى المحاولة مرة أخرى لاحقاً."

    if (error === "Invalid banner ID") {
      title = "معرف عرض غير صالح"
      description = "المعرف المقدم للعرض غير صحيح."
    } else if (error === "Banner not found") {
      title = "عرض غير موجود"
      description = "العرض الخاص الذي تبحث عنه غير موجود."
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-2xl max-w-lg border border-rose-100">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
          <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
            <Link href="/user/home">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!banner || !products || !discountText) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-2xl max-w-lg border border-amber-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">بيانات غير كاملة</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            حدث خطأ أثناء تحميل بيانات العرض. يرجى المحاولة مرة أخرى لاحقاً.
          </p>
          <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
            <Link href="/user/home">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Navigation */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/user/home"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة للصفحة الرئيسية</span>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">عرض حصري لفترة محدودة</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {banner.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-3 rounded-2xl">
                  <span className="text-3xl md:text-4xl font-black">{discountText}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="w-5 h-5" />
                  <span>العرض ساري الآن</span>
                </div>
              </div>

              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0 lg:mr-0 leading-relaxed">
                اكتشف مجموعة متميزة من المنتجات المختارة بعناية بأسعار استثنائية. لا تفوت هذه الفرصة الرائعة!
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Package className="w-6 h-6 text-amber-400" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{products.length}</p>
                    <p className="text-xs text-white/60">منتج متوفر</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Tag className="w-6 h-6 text-emerald-400" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{banner.discountValue || 0}%</p>
                    <p className="text-xs text-white/60">نسبة الخصم</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-rose-500 rounded-3xl rotate-6 opacity-20" />
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20">
                  <Image
                    src={banner.imageUrl || "/placeholder.svg?height=500&width=500&query=discount banner sale"}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">خصم يصل إلى</p>
                      <p className="text-xl font-bold text-gray-900">{discountText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">لا توجد منتجات</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              عذراً، لا توجد منتجات متوفرة حالياً لهذا العرض. يرجى المحاولة لاحقاً.
            </p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
              <Link href="/user/shop">العودة للتسوق</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">منتجات العرض</h2>
              <p className="text-gray-600 text-lg">{products.length} منتج بخصومات حصرية</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const displayPrice = product.salePrice || product.price
                const originalPrice = product.price
                const discountPercentage =
                  product.discount ||
                  (originalPrice > displayPrice
                    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
                    : banner.discountValue || 0)

                return (
                  <Link key={product._id} href={`/user/shop`} className="group">
                    <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                      <div className="relative overflow-hidden bg-gray-100">
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={
                              product.images?.[0] ||
                              product.imageUrl ||
                              `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                            }
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Discount Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
                            {discountPercentage > 0 ? `-${discountPercentage}%` : "عرض"}
                          </Badge>
                        </div>

                        {/* Out of Stock Overlay */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                              نفذت الكمية
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        {/* Category */}
                        <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-snug group-hover:text-rose-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-lg font-bold text-gray-900">{displayPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">ج.م</span>
                          {originalPrice > displayPrice && (
                            <span className="text-sm text-gray-400 line-through mr-auto">
                              {originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          disabled={product.stock === 0}
                          className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2.5 font-medium rounded-xl transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {product.stock > 0 ? "أضف للسلة" : "غير متوفر"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">استمتع بالمزيد من العروض</h3>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                  تصفح جميع منتجاتنا واكتشف المزيد من العروض والخصومات الحصرية
                </p>
                <Button
                  asChild
                  className="bg-white text-gray-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full transition-all duration-300"
                >
                  <Link href="/user/shop">
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    تسوق الآن
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
