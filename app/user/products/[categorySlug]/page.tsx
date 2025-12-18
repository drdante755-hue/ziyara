"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Loader2, ArrowRight, ShoppingBag, Sparkles, Package, SlidersHorizontal, Search } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  name: string
  nameAr?: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  inStock: boolean
  rating: number
  reviews: number
  category: string
  description?: string
  isBestseller?: boolean
  isNew?: boolean
  isFeatured?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  color?: string
  icon?: string
  description?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

type SortOption = "newest" | "price-low" | "price-high" | "featured"

export default function CategoryProductsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const rawSlug = params.categorySlug as string
  const categorySlug = rawSlug && rawSlug !== "undefined" ? decodeURIComponent(rawSlug) : null

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [inStockOnly, setInStockOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || "all")
  const [categoryName, setCategoryName] = useState<string>("")
  const [categoryData, setCategoryData] = useState<Category | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams()

        const currentSlug = selectedCategory !== "all" ? selectedCategory : categorySlug

        if (currentSlug && currentSlug !== "all" && currentSlug !== "undefined") {
          params.append("categorySlug", currentSlug)
        }

        if (searchQuery) {
          params.append("search", searchQuery)
        }

        params.append("page", page.toString())
        params.append("limit", "12")

        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()

        if (!data.success) {
          setError(data.error || "فشل في تحميل المنتجات")
          return
        }

        setProducts(data.products || [])
        setPagination(data.pagination)
        setAllCategories(data.categories || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("حدث خطأ في تحميل البيانات. الرجاء التحقق من الاتصال بالإنترنت")
      } finally {
        setIsLoading(false)
      }
    },
    [selectedCategory, searchQuery, categorySlug],
  )

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categorySlug && categorySlug !== "all" && categorySlug !== "undefined") {
        try {
          const response = await fetch("/api/categories/public")
          const data = await response.json()
          if (data.success) {
            const category = data.data.find((cat: Category) => cat.slug === categorySlug)
            if (category) {
              setCategoryName(category.name)
              setCategoryData(category)
              setSelectedCategory(categorySlug)
            }
          }
        } catch (err) {
          console.error("Error fetching category name:", err)
        }
      }
    }
    fetchCategoryName()
  }, [categorySlug])

  useEffect(() => {
    setCurrentPage(1)
    fetchProducts(1)
  }, [fetchProducts])

  useEffect(() => {
    let result = [...products]

    result = result.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)

    if (inStockOnly) {
      result = result.filter((p) => p.inStock)
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "featured":
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
        break
      case "newest":
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, sortBy, priceRange, inStockOnly])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      discount: product.discount,
    })
  }

  const displayCategoryName =
    selectedCategory === "all" || !selectedCategory ? "جميع المنتجات" : categoryName || selectedCategory

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل المنتجات...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-2xl max-w-lg border border-rose-100">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">حدث خطأ</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()} className="rounded-full px-6">
              العودة للخلف
            </Button>
            <Button
              onClick={() => router.push("/user/shop")}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
            >
              العودة للتسوق
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">تشكيلة متميزة من المنتجات</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {displayCategoryName}
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              اكتشف مجموعتنا المتميزة من المنتجات عالية الجودة بأسعار تنافسية
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Package className="w-6 h-6 text-amber-400" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{pagination?.total || filteredProducts.length}</p>
                  <p className="text-xs text-white/60">منتج متوفر</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border border-gray-200 rounded-xl text-right bg-white focus:ring-2 focus:ring-emerald-500 min-w-[180px]"
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: الأقل للأعلى</option>
              <option value="price-high">السعر: الأعلى للأقل</option>
              <option value="featured">الأكثر مبيعاً</option>
            </select>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 border-gray-200"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>الفلاتر</span>
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نطاق السعر</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="من"
                    value={priceRange.min || ""}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="إلى"
                    value={priceRange.max === 100000 ? "" : priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 100000 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-right text-sm"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg w-full">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">المتوفر فقط</span>
                </label>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("")
                    setPriceRange({ min: 0, max: 100000 })
                    setInStockOnly(false)
                  }}
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  مسح الفلاتر
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-right">
          <p className="text-gray-600">
            عرض <span className="font-bold text-gray-900">{filteredProducts.length}</span> منتج
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">لا توجد منتجات</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              لم نجد منتجات تطابق معاييرك. جرب تغيير الفلاتر أو البحث عن شيء آخر
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setPriceRange({ min: 0, max: 100000 })
                setInStockOnly(false)
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full"
            >
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const displayPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price
                const originalPrice = product.price

                return (
                  <Card
                    key={product.id}
                    className="group h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl"
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={
                            product.image ||
                            `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.discount && product.discount > 0 && (
                          <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
                            جديد
                          </Badge>
                        )}
                        {product.isBestseller && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
                            الأكثر مبيعاً
                          </Badge>
                        )}
                      </div>

                      {/* Out of Stock Overlay */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                            نفذت الكمية
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Category */}
                      <p className="text-xs text-emerald-600 font-medium mb-2">{product.category}</p>

                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-snug group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg font-bold text-gray-900">{displayPrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">ج.م</span>
                        {product.discount && product.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through mr-auto">{originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        disabled={!product.inStock}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2.5 font-medium rounded-xl transition-all duration-300"
                        onClick={() => handleAddToCart(product)}
                      >
                        {product.inStock ? "أضف للسلة" : "غير متوفر"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                    fetchProducts(Math.max(currentPage - 1, 1))
                  }}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  السابق
                </Button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 1, pagination.pages))
                  .map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => {
                        setCurrentPage(page)
                        fetchProducts(page)
                      }}
                      className={`rounded-xl ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    >
                      {page}
                    </Button>
                  ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))
                    fetchProducts(Math.min(currentPage + 1, pagination.pages))
                  }}
                  disabled={currentPage === pagination.pages}
                  className="rounded-xl"
                >
                  التالي
                </Button>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">اكتشف المزيد من المنتجات</h3>
                <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                  تصفح جميع أقسامنا واكتشف المزيد من المنتجات المميزة بأسعار تنافسية
                </p>
                <Button
                  asChild
                  className="bg-white text-emerald-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full transition-all duration-300"
                >
                  <Link href="/user/shop">
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    تصفح جميع المنتجات
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
