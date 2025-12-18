import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

// GET - جلب المنتجات حسب نسبة الخصم
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const minDiscount = Number.parseInt(searchParams.get("minDiscount") || "0")

    if (minDiscount < 0 || minDiscount > 100) {
      return NextResponse.json({ success: false, error: "نسبة الخصم يجب أن تكون بين 0 و 100" }, { status: 400 })
    }

    // جلب المنتجات النشطة التي لديها خصم بالنسبة المحددة أو أكثر
    const products = await Product.find({
      isActive: true,
      discount: { $gte: minDiscount },
    })
      .sort({ discount: -1 })
      .limit(100)
      .lean()

    const formattedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      salePrice: product.salePrice,
      discount: product.discount,
      image: product.images?.[0] || product.imageUrl,
      images: product.images,
      category: product.category,
      stock: product.stock,
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length,
    })
  } catch (error) {
    console.error("Error fetching products by discount:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المنتجات" }, { status: 500 })
  }
}
