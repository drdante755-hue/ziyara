"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IBanner {
  _id: string
  imageUrl: string
  imagePublicId: string
  imageMimeType?: string
  title: string
  actionType: "discount" | "category" | "product" | "url"
  discountType?: "percentage" | "fixed"
  discountValue?: number
  targetCategoryId?: string
  targetProductId?: string
  targetUrl?: string
}

interface BannerCarouselProps {
  position?: string
}

export function BannerCarousel({ position = "user-home-main" }: BannerCarouselProps) {
  const [banners, setBanners] = useState<IBanner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/banners?position=${position}`)
        if (!response.ok) throw new Error("Failed to fetch banners")
        const data = await response.json()
        setBanners(data.data || [])
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [position])

  const goToNext = useCallback(() => {
    if (banners.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [banners.length, isTransitioning])

  const goToPrevious = useCallback(() => {
    if (banners.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [banners.length, isTransitioning])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      goToNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [banners.length, goToNext])

  const handleBannerClick = (banner: IBanner) => {
    switch (banner.actionType) {
      case "discount":
        // Navigate to the dedicated discount page with banner ID
        router.push(`/user/discount/${banner._id}`)
        break
      case "category":
        router.push(`/user/products/all?category=${banner.targetCategoryId}`)
        break
      case "product":
        router.push(`/user/product/${banner.targetProductId}`)
        break
      case "url":
        if (banner.targetUrl?.startsWith("http")) {
          window.open(banner.targetUrl, "_blank")
        } else {
          router.push(banner.targetUrl || "/")
        }
        break
    }
  }

  if (!mounted || isLoading) {
    return <div className="w-full h-48 md:h-64 lg:h-80 bg-muted rounded-xl animate-pulse" />
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Banner Container with RTL sliding */}
      <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
        {/* Banner Slider Track */}
        <div className="relative w-full" style={{ aspectRatio: "4/1" }}>
          <div
            className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(${(currentIndex * 100) / banners.length}%)`,
            }}
          >
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className="relative h-full flex-shrink-0 cursor-pointer group"
                style={{ width: `${100 / banners.length}%` }}
                onClick={() => handleBannerClick(banner)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleBannerClick(banner)
                  }
                }}
                aria-label={`${banner.title} - انقر للانتقال`}
              >
                <Image
                  src={banner.imageUrl || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={index === 0}
                />

                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

                {/* Title overlay */}
                <div className="absolute inset-0 flex items-center justify-end p-4 md:p-8 pointer-events-none">
                  <div className="text-white text-right">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-balance drop-shadow-lg">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {banners.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white z-20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white z-20"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Indicator dots */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-emerald-500 w-8" : "bg-gray-300 w-2"
              }`}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true)
                  setCurrentIndex(index)
                  setTimeout(() => setIsTransitioning(false), 500)
                }
              }}
              title={`الانتقال للبنر ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerCarousel
