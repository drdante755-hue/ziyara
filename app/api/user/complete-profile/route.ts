import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import Category from "@/models/Category"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const categorySlug = searchParams.get("categorySlug")
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const featured = searchParams.get("featured")
    const discount = searchParams.get("discount")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Build query - Only show active products
    const query: any = { status: "نشط" }

    if (discount) {
      const discountValue = Number.parseInt(discount)
      if (!isNaN(discountValue)) {
        // Filter products where discount field matches the specified value
        query.discount = discountValue
      }
    }

    if (categorySlug && categorySlug !== "all" && categorySlug !== "undefined") {
      const decodedSlug = decodeURIComponent(categorySlug)

      // تحويل الـ slug إلى اسم محتمل (استبدال الشرطات بمسافات)
      const possibleName = decodedSlug.replace(/-/g, " ")

      // البحث عن الفئة بعدة طرق
      const categoryDoc = await Category.findOne({
        $or: [
          { slug: decodedSlug },
          { slug: categorySlug },
          { name: possibleName },
          { name: decodedSlug },
          { name: { $regex: new RegExp(`^${possibleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        ],
      }).lean()

      if (categoryDoc) {
        const categoryName = (categoryDoc as any).name

        query.category = categoryName
      } else {
        // fallback: البحث في المنتجات مباشرة بأي شكل من أشكال الاسم
        query.$or = [
          { category: possibleName },
          { category: decodedSlug },
          { category: { $regex: new RegExp(`^${possibleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { categorySlug: decodedSlug },
          { categorySlug: categorySlug },
        ]
      }
    } else if (category && category !== "all" && category !== "undefined") {
      query.category = category
    }

    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { nameAr: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }
      // دمج شروط البحث مع الفئة
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchQuery]
        delete query.$or
      } else if (query.category) {
        query.$and = [{ category: query.category }, searchQuery]
        delete query.category
      } else {
        query.$or = searchQuery.$or
      }
    }

    if (status) {
      query.status = status
    }

    // Get products
    const skip = (page - 1) * limit

    let productsQuery = Product.find(query)

    // If featured, sort by rating and sales
    if (featured === "true") {
      productsQuery = productsQuery.sort({ rating: -1, reviews: -1 })
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 })
    }

    const [products, total, categories] = await Promise.all([
      productsQuery.skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
      Product.distinct("category", { status: "نشط" }),
    ])

    // Transform products for frontend
    const transformedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      originalPrice: product.discount > 0 ? Math.round(product.price / (1 - product.discount / 100)) : undefined,
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      image:
        product.images?.[0] ||
        product.imageUrl ||
        `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name)}`,
      category: product.category,
      inStock: product.stock > 0,
      discount: product.discount || 0,
      isBestseller: product.reviews > 100,
      isNew: product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: product.description || "",
    }))

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المنتجات" }, { status: 500 })
  }
}
