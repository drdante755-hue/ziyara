import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Category from "@/models/Category"
import Product from "@/models/Product"

// GET - جلب تفاصيل القسم والمنتجات التابعة له
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect()

    // ⬅️ حل المشكلة هنا
    const { slug } = await params

    // جلب القسم
    const category = await Category.findOne({ slug }).lean()

    if (!category) {
      return NextResponse.json(
        { success: false, error: "القسم غير موجود" },
        { status: 404 }
      )
    }

    // جلب المنتجات النشطة في هذا القسم
    const products = await Product.find({
      categorySlug: slug,
      status: "نشط",
    })
      .select(
        "_id name nameAr price discount images imageUrl stock isFeatured"
      )
      .lean()

    // تحويل المنتجات للصيغة المطلوبة
    const transformedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      discount: product.discount || 0,
      image:
        product.images?.[0] ||
        product.imageUrl ||
        `/placeholder.svg?height=200&width=200&query=${product.name}`,
      inStock: product.stock > 0,
      isFeatured: product.isFeatured,
      stock: product.stock,
    }))

    return NextResponse.json({
      success: true,
      category: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        color: category.color,
        icon: category.icon,
        description: category.description,
      },
      products: transformedProducts,
      total: transformedProducts.length,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { success: false, error: "فشل في جلب القسم" },
      { status: 500 }
    )
  }
}
