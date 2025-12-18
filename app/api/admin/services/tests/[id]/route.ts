import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Test } from "@/models/Service"

// GET - جلب تحليل واحد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const test = await Test.findById(params.id).lean()

    if (!test) {
      return NextResponse.json({ success: false, error: "التحليل غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: test,
    })
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب التحليل" }, { status: 500 })
  }
}

// PUT - تحديث تحليل
export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const body = await request.json()

    const test = await Test.findByIdAndUpdate(
      id,
      {
        name: body.name,
        price: body.price,
        category: body.category,
        duration: body.duration,
        description: body.description,
        isActive: body.isActive,
      },
      { new: true, runValidators: true },
    )

    if (!test) {
      return NextResponse.json({ success: false, error: "التحليل غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: test,
      message: "تم تحديث التحليل بنجاح",
    })
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث التحليل" }, { status: 500 })
  }
}

// DELETE - حذف تحليل
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const test = await Test.findByIdAndDelete(id)

    if (!test) {
      return NextResponse.json({ success: false, error: "التحليل غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف التحليل بنجاح",
    })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف التحليل" }, { status: 500 })
  }
}
