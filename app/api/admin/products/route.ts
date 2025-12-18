import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

// GET - جلب جميع المنتجات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // بناء الفلتر
    const filter: any = {}

    if (category && category !== "الكل") {
      filter.category = category
    }

    if (status && status !== "الكل") {
      filter.status = status
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameAr: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المنتجات" }, { status: 500 })
  }
}

// POST - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    // التحقق من الحقول المطلوبة
    if (!body.name || !body.price || body.stock === undefined) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const product = await Product.create({
      name: body.name,
      nameAr: body.nameAr,
      description: body.description,
      price: body.price,
      salePrice: body.salePrice,
      discount: body.discount || 0,
      category: body.category,
      images: body.images || [],
      imageUrl: body.imageUrl,
      stock: body.stock,
      sku: body.sku,
      isActive: body.status === "نشط",
      status: body.status || "نشط",
      isFeatured: body.isFeatured,
      tags: body.tags,
      paymentMethod: body.paymentMethod,
      paymentNumber: body.paymentNumber,
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: "تم إضافة المنتج بنجاح",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 })
  }
}
