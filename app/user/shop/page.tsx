"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ShoppingBag, Sparkles, Package, Search, X, SlidersHorizontal, Tag } from "lucide-react"

interface ShopProduct {
  id: string
  name: string
  nameAr?: string
  price: number
  discount?: number
  image: string
  inStock: boolean
  stock: number
  category: string
  isNew?: boolean
  isBestseller?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

type SortOption = "newest" | "price-low" | "price-high" | "featured"

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [categoriesRes, productsRes] = await Promise.all([fetch("/api/categories/public"), fetch("/api/products")])

      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()

      if (categoriesData.success) {
        setCategories(
          categoriesData.data.map((cat: any) => ({
            id: cat._id,
            name: cat.name,
            slug: cat.slug,
            color: cat.color,
            icon: cat.icon,
          })),
        )
      }

      if (productsData.success) {
        setProducts(
          productsData.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            nameAr: p.nameAr,
            price: p.price,
            discount: p.discount,
            image: p.image,
            inStock: p.inStock,
            stock: p.stock,
            category: p.category,
            isNew: p.isNew,
            isBestseller: p.isBestseller,
          })),
        )
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let result = [...products]

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

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
        result.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0))
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, selectedCategory, sortBy, priceRange, searchQuery, inStockOnly])

  const handleAddToCart = (product: ShopProduct) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        discount: product.discount || 0,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("تمت إضافة المنتج للسلة")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل المنتجات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
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
              <span className="text-sm font-medium">أفضل المنتجات الصحية</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              تسوّق الأدوية والمنتجات الصحية
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              اكتشف مجموعتنا الكاملة من الأدوية والمنتجات الصحية بأسعار تنافسية وجودة عالية
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6">
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
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                  <p className="text-xs text-white/60">قسم متنوع</p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Pills */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-right">الأقسام</h2>
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full ${selectedCategory === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              جميع الأقسام
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full ${selectedCategory === category.name ? "bg-blue-600 hover:bg-blue-700" : ""}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              className="px-4 py-3 border border-gray-200 rounded-xl text-right bg-white focus:ring-2 focus:ring-blue-500 min-w-[180px]"
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: الأقل للأعلى</option>
              <option value="price-high">السعر: الأعلى للأقل</option>
              <option value="featured">المنتجات المتوفرة</option>
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
                    value={priceRange.max === 10000 ? "" : priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 10000 })}
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
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
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
                    setPriceRange({ min: 0, max: 10000 })
                    setInStockOnly(false)
                    setSelectedCategory("all")
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
            <p className="text-gray-600 mb-8 max-w-md mx-auto">لم نجد منتجات تطابق بحثك. جرب البحث عن شيء آخر</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setPriceRange({ min: 0, max: 10000 })
                setSelectedCategory("all")
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full"
            >
              مسح البحث
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
                          <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg">
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
                      <p className="text-xs text-blue-600 font-medium mb-2">{product.category}</p>

                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2.5 font-medium rounded-xl transition-all duration-300"
                        onClick={() => handleAddToCart(product)}
                      >
                        {product.inStock ? "أضف للسلة" : "غير متوفر"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">هل تحتاج مساعدة؟</h3>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                  فريقنا متاح لمساعدتك في اختيار المنتجات المناسبة لاحتياجاتك الصحية
                </p>
                <Button
                  asChild
                  className="bg-white text-blue-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full transition-all duration-300"
                >
                  <Link href="/user/home">
                    <ArrowRight className="w-5 h-5 ml-2" />
                    العودة للرئيسية
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
