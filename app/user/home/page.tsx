"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopHeader } from "@/components/top-header"
import { BottomNavbar } from "@/components/bottom-navbar"
import { SearchOverlay } from "@/components/search-overlay"
import { NurseRequestOverlay } from "@/components/nurse-request-overlay"
import { LabTestOverlay } from "@/components/lab-test-overlay"
import { CartOverlay } from "@/components/cart-overlay"
import { CartAddedModal } from "@/components/cart-added-modal"
import CategoryCards from "@/components/category-cards"
import ProductCard from "@/components/product-card"
import { BannerCarousel } from "@/components/banner-carousel"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/contexts/cart-context"
import {
  Filter,
  SlidersHorizontal,
  Clock,
  AlertCircle,
  Shield,
  Truck,
  ArrowRight,
  Sparkles,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
  Award,
  ArrowLeft,
  Building2,
  Stethoscope,
  TestTube,
  Activity,
  Calendar,
  HeartPulse,
  Pill,
  UserCheck,
  BadgeCheck,
  TrendingUp,
  Search,
} from "lucide-react"

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
  stock?: number
}

interface HomeStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  completedOrders: number
  avgDeliveryTime: string
}
type SortOption = "name" | "price-low" | "price-high" | "rating" | "newest" | "bestseller"
type FilterOption = "all" | "in-stock" | "discount" | "bestseller" | "new"

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { addToCart, setIsCartOpen } = useCart()

  const [activeSection, setActiveSection] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [showNurseRequestOverlay, setShowNurseRequestOverlay] = useState(false)
  const [showLabTestOverlay, setShowLabTestOverlay] = useState(false)

  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const [sessionExpired, setSessionExpired] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const [homeStats, setHomeStats] = useState<HomeStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const fetchHomeStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch("/api/home/stats")
      const data = await response.json()
      if (data.success) {
        setHomeStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching home stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  const fetchProducts = useCallback(async (category?: string) => {
    try {
      setIsLoadingProducts(true)
      setProductsError(null)

      const params = new URLSearchParams()
      if (category && category !== "home") {
        params.set("category", category)
      }
      params.set("limit", "50")

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setCategories(data.categories || [])
      } else {
        setProductsError(data.error || "فشل في جلب المنتجات")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProductsError("فشل في الاتصال بالخادم")
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=8")
      const data = await response.json()

      if (data.success) {
        setFeaturedProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  }, [])

  useEffect(() => {
    fetchHomeStats()

    if (activeSection === "home") {
      fetchFeaturedProducts()
      fetchProducts()
    } else if (
      ["local", "imported", "rare", "supplements", "skincare", "baby", "medical", "energy"].includes(activeSection)
    ) {
      fetchProducts(activeSection)
    }
  }, [activeSection, fetchProducts, fetchFeaturedProducts, fetchHomeStats])

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch("/api/user/check-profile")
          const data = await response.json()

          if (data.success && !data.profileCompleted) {
            router.push("/user/user-info")
          }
        } catch (error) {
          console.error("Error checking profile completion:", error)
        }
      }
    }

    checkProfileCompletion()
  }, [session, status, router])

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
      )
      return match ? decodeURIComponent(match[1]) : undefined
    }

    const checkExpiry = () => {
      const expRaw = getCookie("ziyara_auth_exp")
      const now = Math.floor(Date.now() / 1000)
      const exp = expRaw ? Number.parseInt(expRaw, 10) : undefined
      if (exp && Number.isFinite(exp) && exp <= now) {
        setSessionExpired(true)
        return true
      }
      return false
    }

    if (checkExpiry()) return

    const expRaw = getCookie("ziyara_auth_exp")
    let timer: any
    if (expRaw) {
      const exp = Number.parseInt(expRaw, 10)
      const msUntil = Math.max(0, exp * 1000 - Date.now())
      timer = setTimeout(() => setSessionExpired(true), msUntil)
    } else {
      timer = setInterval(checkExpiry, 60000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  const filterProducts = (products: Product[], filter: FilterOption) => {
    switch (filter) {
      case "in-stock":
        return products.filter((p) => p.inStock)
      case "discount":
        return products.filter((p) => p.discount && p.discount > 0)
      case "bestseller":
        return products.filter((p) => p.isBestseller)
      case "new":
        return products.filter((p) => p.isNew)
      default:
        return products
    }
  }

  const sortProducts = (products: Product[], sort: SortOption) => {
    const sorted = [...products]
    switch (sort) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case "bestseller":
        return sorted.sort((a) => (a.isBestseller ? -1 : 1))
      case "newest":
        return sorted.sort((a) => (a.isNew ? -1 : 1))
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"))
      default:
        return sorted
    }
  }

  const applyFiltersAndSort = (products: Product[]) => {
    let result = filterProducts(products, filterBy)
    result = sortProducts(result, sortBy)
    return result
  }

  const handleSectionChange = (section: string) => {
    if (section === "search") {
      setShowSearchOverlay(true)
    } else if (section === "nurse") {
      setShowNurseRequestOverlay(true)
    } else if (section === "lab") {
      router.push("/user/lab-test")
      return
    } else if (section === "cart") {
      setIsCartOpen(true)
      return
    } else if (section === "appointment") {
      router.push("/user/online-consultation")
      return
    } else if (section === "profile") {
      router.push("/user/profile")
    } else {
      setActiveSection(section)
    }
  }

  const handleStartShopping = () => {
    router.push("/user/products/all")
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  const ProductsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-md">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5 text-center">
            <Skeleton className="w-12 h-12 rounded-xl mx-auto mb-3" />
            <Skeleton className="h-7 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const categoryTitles: Record<string, string> = {
    local: "الأدوية المحلية",
    imported: "الأدوية المستوردة",
    rare: "الأدوية النادرة",
    supplements: "المكملات الغذائية",
    skincare: "العناية بالبشرة",
    baby: "منتجات الأطفال",
    medical: "الأجهزة الطبية",
    energy: "مقويات الطاقة",
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k+`
    }
    return num.toString()
  }

  const services = [
    {
      id: "hospitals",
      title: "المستشفيات",
      description: "أفضل المستشفيات والمراكز الطبية",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/user/hospitals",
    },
    {
      id: "clinics",
      title: "العيادات",
      description: "عيادات متخصصة في جميع التخصصات",
      icon: Stethoscope,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/user/clinics",
    },
    {
      id: "doctors",
      title: "الأطباء",
      description: "احجز موعد مع أفضل الأطباء",
      icon: UserCheck,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      href: "/user/doctors",
    },
    {
      id: "lab",
      title: "التحاليل المنزلية",
      description: "تحاليل طبية في منزلك",
      icon: TestTube,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      href: "/user/lab-test",
    },
    {
      id: "nurse",
      title: "التمريض المنزلي",
      description: "رعاية تمريضية احترافية",
      icon: HeartPulse,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      action: () => setShowNurseRequestOverlay(true),
    },
    {
      id: "pharmacy",
      title: "صيدلية زيارة",
      description: "أدوية أصلية بأسعار مميزة",
      icon: Pill,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/user/products/all",
    },
  ]

  const features = [
    {
      icon: Shield,
      title: "جودة مضمونة",
      description: "منتجات أصلية 100%",
    },
    {
      icon: Truck,
      title: "توصيل سريع",
      description: "خلال 24-48 ساعة",
    },
    {
      icon: Clock,
      title: "دعم 24/7",
      description: "خدمة عملاء متواصلة",
    },
    {
      icon: BadgeCheck,
      title: "مرخص رسمياً",
      description: "من وزارة الصحة",
    },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8 sm:space-y-12">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 lg:p-14">
                <div className="max-w-3xl">
                  {/* Brand Badge */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-2.5">
                      <Image src="/images/Ziyara-logo.png" alt="زيارة" width={44} height={33} className="object-contain" />
                    </div>
                    <Badge className="bg-amber-400/90 text-emerald-950 border-0 px-4 py-1.5 text-xs font-bold">
                      <Award className="w-3.5 h-3.5 ml-1.5" />
                      الأفضل في مصر
                    </Badge>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    صحتك أولويتنا
                    <br />
                    <span className="text-amber-300">ثقة وأمان في كل طلب</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
                    منصة طبية متكاملة تقدم لك أفضل الأدوية والخدمات الصحية مع ضمان الجودة والتوصيل السريع
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      onClick={handleStartShopping}
                      className="bg-white text-emerald-700 hover:bg-gray-50 text-base px-8 py-5 rounded-xl font-bold shadow-lg transition-all duration-300 group"
                    >
                      <ShoppingCart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                      ابدأ التسوق
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-[-3px] transition-transform" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push("/user/doctors")}
                      className="border-2 border-white/30 text-white hover:bg-white/10 text-base px-8 py-5 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300"
                    >
                      <Calendar className="w-5 h-5 ml-2" />
                      احجز موعد
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-3xl mx-auto">
              <button onClick={() => setShowSearchOverlay(true)} className="w-full group">
                <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Search className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-gray-800 font-semibold text-sm mb-0.5">ابحث عن احتياجاتك الصحية</div>
                      <div className="text-gray-400 text-xs">أدوية، مكملات، أجهزة طبية...</div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </button>
            </section>

            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">خدماتنا الطبية</h2>
                <p className="text-gray-500 text-sm">جميع الخدمات الصحية في مكان واحد</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => (service.action ? service.action() : router.push(service.href!))}
                  >
                    <CardContent className="p-5">
                      <div
                        className={`w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <service.icon className={`w-6 h-6 ${service.iconColor}`} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{service.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Banner Carousel */}
            <BannerCarousel position="user-home-main" />

            <section>
              {isLoadingStats ? (
                <StatsSkeleton />
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {homeStats ? formatNumber(homeStats.totalUsers) : "0"}
                      </div>
                      <div className="text-gray-500 text-xs font-medium">عميل يثق بنا</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {homeStats ? formatNumber(homeStats.totalProducts) : "0"}
                      </div>
                      <div className="text-gray-500 text-xs font-medium">منتج متوفر</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">24/7</div>
                      <div className="text-gray-500 text-xs font-medium">دعم متواصل</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm">
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {homeStats ? formatNumber(homeStats.completedOrders) : "0"}
                      </div>
                      <div className="text-gray-500 text-xs font-medium">طلب مكتمل</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">المنتجات المميزة</h2>
                  </div>
                  <p className="text-gray-500 text-sm">منتجات مختارة بعناية لك</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleStartShopping}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-sm font-medium"
                >
                  عرض الكل
                  <ArrowLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>

              {isLoadingProducts ? (
                <ProductsSkeleton />
              ) : productsError ? (
                <div className="text-center py-10">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{productsError}</h3>
                  <Button variant="outline" onClick={() => fetchFeaturedProducts()} className="mt-3" size="sm">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات حالياً</h3>
                  <p className="text-gray-500 text-sm">سيتم إضافة المنتجات قريباً</p>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
                  <Activity className="w-3.5 h-3.5" />
                  خدمات منزلية
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">الرعاية الصحية في منزلك</h2>
                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                  نوفر لك خدمات طبية احترافية بدون الحاجة للخروج من منزلك
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nurse Service Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <HeartPulse className="w-7 h-7 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">ممرض منزلي</h3>
                        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                          رعاية تمريضية احترافية من ممرضين مرخصين
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
                          onClick={() => setShowNurseRequestOverlay(true)}
                        >
                          احجز الآن
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lab Test Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <TestTube className="w-7 h-7 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">تحليل منزلي</h3>
                        <p className="text-gray-500 text-xs mb-4 leading-relaxed">نتائج دقيقة ومعتمدة خلال 24 ساعة</p>
                        <Button
                          size="sm"
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"
                          onClick={() => router.push("/user/lab-test")}
                        >
                          احجز الآن
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Doctor Consultation Card */}
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Stethoscope className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">استشارة طبية</h3>
                        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                          احجز موعد مع أفضل الأطباء المتخصصين
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                          onClick={() => router.push("/user/doctors")}
                        >
                          احجز الآن
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Category Cards */}
            <CategoryCards />

            <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">لماذا تختار زيارة؟</h2>
                <p className="text-gray-500 text-sm">مميزات تجعلنا الخيار الأول لك</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <feature.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                    <p className="text-gray-500 text-xs">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-10">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
              </div>

              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  ابدأ رحلتك الصحية
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">جاهز للاهتمام بصحتك؟</h2>
                <p className="text-white/80 mb-6 text-sm sm:text-base">
                  انضم لآلاف العملاء الذين يثقون بنا لتوفير احتياجاتهم الصحية
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={handleStartShopping}
                    className="bg-white text-emerald-700 hover:bg-gray-50 px-8 py-5 rounded-xl font-bold shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5 ml-2" />
                    تصفح المنتجات
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowSearchOverlay(true)}
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-5 rounded-xl font-semibold"
                  >
                    ابحث عن منتج
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )

      case "local":
      case "imported":
      case "rare":
      case "supplements":
      case "skincare":
      case "baby":
      case "medical":
      case "energy":
        const categoryTitle = categoryTitles[activeSection] || "قسم جديد"
        const processedProducts = applyFiltersAndSort(products)

        return (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-right">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{categoryTitle}</h2>
                <p className="text-gray-600 mt-1 text-lg">
                  {processedProducts.length} من {products.length} منتج
                </p>
              </div>

              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white hover:bg-emerald-50"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                  >
                    <Filter className="w-4 h-4" />
                    فلترة
                  </Button>

                  {showFilterMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      {[
                        { value: "all" as FilterOption, label: "جميع المنتجات" },
                        { value: "in-stock" as FilterOption, label: "المتوفرة فقط" },
                        { value: "discount" as FilterOption, label: "على خصم" },
                        { value: "bestseller" as FilterOption, label: "الأكثر مبيعاً" },
                        { value: "new" as FilterOption, label: "منتجات جديدة" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterBy(option.value)
                            setShowFilterMenu(false)
                          }}
                          className={`w-full text-right px-4 py-2 hover:bg-emerald-50 transition-colors ${
                            filterBy === option.value
                              ? "bg-emerald-100 text-emerald-700 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white hover:bg-emerald-50"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    ترتيب
                  </Button>

                  {showSortMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      {[
                        { value: "newest" as SortOption, label: "الأحدث أولاً" },
                        { value: "name" as SortOption, label: "حسب الاسم (أ-ي)" },
                        { value: "price-low" as SortOption, label: "السعر: من الأقل للأعلى" },
                        { value: "price-high" as SortOption, label: "السعر: من الأعلى للأقل" },
                        { value: "rating" as SortOption, label: "التقييم الأعلى" },
                        { value: "bestseller" as SortOption, label: "الأكثر مبيعاً" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value)
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-right px-4 py-2 hover:bg-emerald-50 transition-colors ${
                            sortBy === option.value ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoadingProducts ? (
              <ProductsSkeleton />
            ) : productsError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{productsError}</h3>
                <Button variant="outline" onClick={() => fetchProducts(activeSection)} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة المحاولة
                </Button>
              </div>
            ) : processedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على منتجات</h3>
                <p className="text-gray-600 mb-6">حاول تغيير معايير البحث أو الفلترة</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterBy("all")
                    setSortBy("newest")
                  }}
                  className="bg-transparent hover:bg-emerald-50"
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}

            {/* Back to Categories Button */}
            <div className="text-center pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveSection("home")}
                className="bg-transparent hover:bg-emerald-50 hover:border-emerald-300 px-8 py-4"
              >
                العودة إلى الصفحة الرئيسية
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">قسم غير متوفر</h2>
              <p className="text-gray-600 text-lg mb-8">هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
              <Button
                onClick={() => setActiveSection("home")}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4"
              >
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50" suppressHydrationWarning>
      <TopHeader activeSection={activeSection} onSectionChange={handleSectionChange} />

      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-24 lg:pb-28 mb-15">
        {renderContent()}
      </main>

      <BottomNavbar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
      <NurseRequestOverlay isOpen={showNurseRequestOverlay} onClose={() => setShowNurseRequestOverlay(false)} />
      <LabTestOverlay isOpen={showLabTestOverlay} onClose={() => setShowLabTestOverlay(false)} />
      <CartOverlay />

      <CartAddedModal />

      <Dialog open={sessionExpired} onOpenChange={(open) => !open}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right">انتهت مدة تسجيل الدخول</DialogTitle>
          </DialogHeader>
          <div className="text-right text-gray-600">لقد انتهت مدة جلستك. يرجى إعادة تسجيل الدخول للمتابعة.</div>
          <DialogFooter>
            <Button
              onClick={() => {
                router.push("/?reason=expired&redirect=")
              }}
              className="ml-auto"
            >
              موافق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
