import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Category from "@/models/Category"
import Product from "@/models/Product"

// GET - جلب قسم محدد
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ success: false, error: "القسم غير موجود" }, { status: 404 })
    }

    const productCount = await Product.countDocuments({ category: category.name })

    return NextResponse.json({
      success: true,
      category: {
        ...category.toObject(),
        products: productCount,
      },
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب القسم" }, { status: 500 })
  }
}

// PUT - تحديث قسم
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()
    const { name, color, icon } = body

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ success: false, error: "القسم غير موجود" }, { status: 404 })
    }

    // التحقق من عدم وجود قسم آخر بنفس الاسم
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name: name.trim() })
      if (existingCategory) {
        return NextResponse.json({ success: false, error: "يوجد قسم آخر بنفس الاسم" }, { status: 400 })
      }

      // تحديث اسم القسم في المنتجات المرتبطة
      await Product.updateMany({ category: category.name }, { category: name.trim() })
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name?.trim() || category.name,
        color: color || category.color,
        icon: icon || category.icon,
      },
      { new: true },
    )

    const productCount = await Product.countDocuments({ category: updatedCategory.name })

    return NextResponse.json({
      success: true,
      message: "تم تحديث القسم بنجاح",
      category: {
        ...updatedCategory.toObject(),
        products: productCount,
      },
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث القسم" }, { status: 500 })
  }
}

// DELETE - حذف قسم
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ success: false, error: "القسم غير موجود" }, { status: 404 })
    }

    // التحقق من عدم وجود منتجات مرتبطة
    const productCount = await Product.countDocuments({ category: category.name })
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: `لا يمكن حذف القسم لأنه يحتوي على ${productCount} منتج` },
        { status: 400 },
      )
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "تم حذف القسم بنجاح",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف القسم" }, { status: 500 })
  }
}
