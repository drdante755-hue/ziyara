import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Category from "@/models/Category"
import Product from "@/models/Product"

// GET - جلب جميع الأقسام مع عدد المنتجات
export async function GET() {
  try {
    await dbConnect()

    const categories = await Category.find({}).select("name slug color icon description").lean()

    const categoriesWithCount = await Promise.all(
      categories.map(async (category: any) => {
        const categorySlug = category.slug || category.name.replace(/\s+/g, "-")

        const productCount = await Product.countDocuments({
          $or: [{ category: category.name }, { categorySlug: categorySlug }],
          status: "نشط",
        })

        return {
          id: category._id.toString(),
          _id: category._id.toString(),
          name: category.name,
          slug: categorySlug,
          color: category.color || "#10b981",
          icon: category.icon || "Pill",
          description: category.description,
          productCount,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
      total: categoriesWithCount.length,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الأقسام" }, { status: 500 })
  }
}
