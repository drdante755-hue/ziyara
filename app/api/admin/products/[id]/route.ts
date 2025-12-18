import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"

// GET - جلب منتج واحد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const product = await Product.findById(params.id).lean()

    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المنتج" }, { status: 500 })
  }
}

// PUT - تحديث منتج
export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop();
    await dbConnect()

    const body = await request.json()

    const product = await Product.findByIdAndUpdate(
        id,
      {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice,
        discount: body.discount,
        category: body.category,
        images: body.images,
        imageUrl: body.imageUrl,
        stock: body.stock,
        sku: body.sku,
        isActive: body.status === "نشط",
        status: body.status,
        isFeatured: body.isFeatured,
        tags: body.tags,
        paymentMethod: body.paymentMethod,
        paymentNumber: body.paymentNumber,
      },
      { new: true, runValidators: true },
    )

    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: "تم تحديث المنتج بنجاح",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث المنتج" }, { status: 500 })
  }
}

// DELETE - حذف منتج
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop();
    await dbConnect()

    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف المنتج" }, { status: 500 })
  }
}
