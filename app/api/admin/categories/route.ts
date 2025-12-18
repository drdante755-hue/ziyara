import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Category from "@/models/Category"
import Product from "@/models/Product"

// GET - جلب جميع الأقسام مع عدد المنتجات
export async function GET() {
  try {
    await dbConnect()

    const categories = await Category.find({}).sort({ createdAt: -1 })

    // حساب عدد المنتجات لكل قسم
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name })
        return {
          _id: category._id,
          name: category.name,
          color: category.color,
          icon: category.icon,
          products: productCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
      total: categories.length,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الأقسام" }, { status: 500 })
  }
}

// POST - إضافة قسم جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, color, icon } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "اسم القسم مطلوب" }, { status: 400 })
    }

    // التحقق من عدم وجود قسم بنفس الاسم
    const existingCategory = await Category.findOne({ name: name.trim() })
    if (existingCategory) {
      return NextResponse.json({ success: false, error: "يوجد قسم بنفس الاسم" }, { status: 400 })
    }

    const category = await Category.create({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      color: color || "#10b981",
      icon: icon || "Pill",
    })

    return NextResponse.json({
      success: true,
      message: "تم إضافة القسم بنجاح",
      category: {
        ...category.toObject(),
        products: 0,
      },
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ success: false, error: "فشل في إضافة القسم" }, { status: 500 })
  }
}
