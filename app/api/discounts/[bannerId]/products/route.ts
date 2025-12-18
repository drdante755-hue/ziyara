import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import Banner from "@/models/Banner"

export async function GET(request: NextRequest, { params }: { params: Promise<{ bannerId: string }> }) {
  try {
    await dbConnect()

    const { bannerId } = await params

    // Validate bannerId
    if (!bannerId) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 })
    }

    // Find the banner first to get discount info
    const banner = await Banner.findById(bannerId).lean()

    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 })
    }

    // Check if banner is active and valid
    const now = new Date()
    const isValid =
      banner.isActive &&
      banner.actionType === "discount" &&
      new Date(banner.startDate) <= now &&
      new Date(banner.endDate) >= now

    if (!isValid) {
      return NextResponse.json({ success: false, error: "عرض الخصم غير متاح حالياً" }, { status: 400 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Find products linked to this banner
    const [products, total] = await Promise.all([
      Product.find({
        discountBannerId: bannerId,
        status: "نشط",
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Product.countDocuments({
        discountBannerId: bannerId,
        status: "نشط",
      }),
    ])

    // Transform products with discount applied
    const transformedProducts = products.map((product: any) => {
      let finalPrice = product.price
      const originalPrice = product.price

      // Apply banner discount
      if (banner.discountType === "percentage" && banner.discountValue) {
        finalPrice = Math.round(product.price * (1 - banner.discountValue / 100))
      } else if (banner.discountType === "fixed" && banner.discountValue) {
        finalPrice = Math.max(0, product.price - banner.discountValue)
      }

      return {
        id: product._id.toString(),
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        price: finalPrice,
        originalPrice: originalPrice,
        discount: banner.discountValue || 0,
        discountType: banner.discountType,
        rating: product.rating || 4.5,
        reviews: product.reviews || 0,
        image:
          product.images?.[0] ||
          product.imageUrl ||
          `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`,
        category: product.category,
        inStock: product.stock > 0,
        stock: product.stock,
        isBestseller: product.reviews > 100,
        isNew: product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    })

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        discountType: banner.discountType,
        discountValue: banner.discountValue,
        endDate: banner.endDate,
      },
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching discount products:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب منتجات العرض" }, { status: 500 })
  }
}
