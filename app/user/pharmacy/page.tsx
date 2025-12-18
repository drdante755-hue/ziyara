"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import ProductCard from "@/components/product-card"
import PageHeader from "@/components/ui/page-header"
import SearchFilters from "@/components/ui/search-filters"
import EmptyState from "@/components/ui/empty-state"
import { Pill, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const categories = ["أدوية", "مكملات غذائية", "فيتامينات", "عناية شخصية", "مستلزمات طبية", "أجهزة طبية"]

export default function PharmacyPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category !== "all") params.append("category", category)

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setTimeout(fetchProducts, 100)
  }

  const handleAddToCart = (product: Product) => {
    toast({
      title: "تمت الإضافة",
      description: `تم إضافة ${product.name} إلى السلة`,
    })
  }

  const filterContent = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">التصنيف</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="جميع التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSearch} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
          تطبيق
        </Button>
        <Button variant="outline" onClick={clearFilters} className="rounded-xl bg-transparent">
          مسح
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="صيدلية زيارة"
        description="أدوية ومستلزمات طبية بأسعار تنافسية"
        icon={Pill}
        gradient="from-emerald-600 to-emerald-500"
      />

      <SearchFilters
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
        placeholder="ابحث عن منتج..."
        filterContent={filterContent}
      />

      <div className="p-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Pill}
            title="لا توجد منتجات"
            description="جرب تغيير معايير البحث"
            actionLabel="مسح الفلاتر"
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  )
}
