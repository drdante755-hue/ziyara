import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Nurse } from "@/models/Service"

// GET - جلب ممرضة واحدة
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const nurse = await Nurse.findById(params.id).lean()

    if (!nurse) {
      return NextResponse.json({ success: false, error: "الممرضة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: nurse,
    })
  } catch (error) {
    console.error("Error fetching nurse:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الممرضة" }, { status: 500 })
  }
}

// PUT - تحديث ممرضة
export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const body = await request.json()

    const nurse = await Nurse.findByIdAndUpdate(
      id,
      {
        name: body.name,
        specialty: body.specialty,
        experience: body.experience,
        phone: body.phone,
        available: body.available,
        imageUrl: body.imageUrl,
        price: body.price,
        location: body.location,
      },
      { new: true, runValidators: true },
    )

    if (!nurse) {
      return NextResponse.json({ success: false, error: "الممرضة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: nurse,
      message: "تم تحديث الممرضة بنجاح",
    })
  } catch (error) {
    console.error("Error updating nurse:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث الممرضة" }, { status: 500 })
  }
}

// DELETE - حذف ممرضة
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const nurse = await Nurse.findByIdAndDelete(id)

    if (!nurse) {
      return NextResponse.json({ success: false, error: "الممرضة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف الممرضة بنجاح",
    })
  } catch (error) {
    console.error("Error deleting nurse:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف الممرضة" }, { status: 500 })
  }
}
