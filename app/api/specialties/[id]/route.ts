import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Specialty from "@/models/Specialty"

// GET - جلب تخصص معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const specialty = await Specialty.findById(id).lean()

    if (!specialty) {
      return NextResponse.json({ success: false, error: "التخصص غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      specialty: {
        id: (specialty as any)._id.toString(),
        name: (specialty as any).name,
        nameAr: (specialty as any).nameAr,
        slug: (specialty as any).slug,
        description: (specialty as any).description,
        descriptionAr: (specialty as any).descriptionAr,
        icon: (specialty as any).icon,
        image: (specialty as any).image,
        isActive: (specialty as any).isActive,
        order: (specialty as any).order,
      },
    })
  } catch (error) {
    console.error("Error fetching specialty:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب التخصص" }, { status: 500 })
  }
}

// PUT - تحديث تخصص
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const specialty = await Specialty.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()

    if (!specialty) {
      return NextResponse.json({ success: false, error: "التخصص غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      specialty: {
        id: (specialty as any)._id.toString(),
        name: (specialty as any).name,
        nameAr: (specialty as any).nameAr,
      },
    })
  } catch (error) {
    console.error("Error updating specialty:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث التخصص" }, { status: 500 })
  }
}

// DELETE - حذف تخصص
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const specialty = await Specialty.findByIdAndDelete(id)

    if (!specialty) {
      return NextResponse.json({ success: false, error: "التخصص غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "تم حذف التخصص بنجاح" })
  } catch (error) {
    console.error("Error deleting specialty:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف التخصص" }, { status: 500 })
  }
}
