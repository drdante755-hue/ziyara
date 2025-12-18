"use client"

import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, History, TrendingUp, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

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
}

const RECENT_SEARCHES_KEY = "ziyara_recent_searches"
const MAX_RECENT_SEARCHES = 5

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([
    "أدوية السكري",
    "مكملات غذائية",
    "أدوية الحساسية",
    "منتجات العناية بالبشرة",
  ])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved))
        } catch {
          setRecentSearches([])
        }
      }
    }
  }, [isOpen])

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return

    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT_SEARCHES)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  const fetchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.products)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching products:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchProducts(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchProducts])

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      setSearchQuery(query)
      saveRecentSearch(query)
      fetchProducts(query)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  const handleProductClick = (product: Product) => {
    onClose()
    router.push(`/user/products/all?search=${encodeURIComponent(product.name)}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="flex flex-col h-full">
        <SheetHeader className="flex flex-row items-center justify-between pr-6">
          <SheetTitle className="text-xl font-bold text-gray-900">البحث</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>

        <div className="p-4 border-b flex items-center gap-2">
          <Input
            placeholder="ابحث عن الأدوية والمنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="flex-1"
            autoFocus
          />
          <Button
            onClick={() => handleSearch()}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {searchQuery.trim() ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {isSearching ? "جاري البحث..." : `نتائج البحث (${searchResults.length})`}
              </h3>
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative h-32 mb-3 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                        {product.discount && product.discount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            خصم {product.discount}%
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">{product.price} جنيه</span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                          disabled={!product.inStock}
                        >
                          {product.inStock ? "أضف" : "نفذ"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لم يتم العثور على نتائج لـ "{searchQuery}"</p>
                  <p className="text-sm mt-2">جرب البحث بكلمات مختلفة</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-600" />
                      عمليات البحث الأخيرة
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 text-xs"
                      onClick={clearRecentSearches}
                    >
                      مسح الكل
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="rounded-full bg-transparent hover:bg-emerald-50 hover:border-emerald-300"
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  عمليات البحث الشائعة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="rounded-full bg-transparent hover:bg-emerald-50 hover:border-emerald-300"
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
