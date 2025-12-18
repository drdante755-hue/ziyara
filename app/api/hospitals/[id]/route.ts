import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Hospital from "@/models/Hospital"

// GET - جلب مستشفى معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const hospital = await Hospital.findById(id).lean()

    if (!hospital) {
      return NextResponse.json({ success: false, error: "المستشفى غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      hospital: {
        id: (hospital as any)._id.toString(),
        name: (hospital as any).name,
        nameAr: (hospital as any).nameAr,
        slug: (hospital as any).slug,
        description: (hospital as any).description,
        descriptionAr: (hospital as any).descriptionAr,
        address: (hospital as any).address,
        city: (hospital as any).city,
        area: (hospital as any).area,
        phone: (hospital as any).phone,
        emergencyPhone: (hospital as any).emergencyPhone,
        email: (hospital as any).email,
        website: (hospital as any).website,
        images: (hospital as any).images,
        logo: (hospital as any).logo,
        departments: (hospital as any).departments,
        specialties: (hospital as any).specialties,
        workingHours: (hospital as any).workingHours,
        hasEmergency: (hospital as any).hasEmergency,
        hasICU: (hospital as any).hasICU,
        hasPharmacy: (hospital as any).hasPharmacy,
        hasLab: (hospital as any).hasLab,
        bedCount: (hospital as any).bedCount,
        rating: (hospital as any).rating,
        reviewsCount: (hospital as any).reviewsCount,
        isActive: (hospital as any).isActive,
        isFeatured: (hospital as any).isFeatured,
        amenities: (hospital as any).amenities,
        insuranceAccepted: (hospital as any).insuranceAccepted,
        accreditations: (hospital as any).accreditations,
      },
    })
  } catch (error) {
    console.error("Error fetching hospital:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المستشفى" }, { status: 500 })
  }
}

// PUT - تحديث مستشفى
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const hospital = await Hospital.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()

    if (!hospital) {
      return NextResponse.json({ success: false, error: "المستشفى غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      hospital: {
        id: (hospital as any)._id.toString(),
        name: (hospital as any).name,
        nameAr: (hospital as any).nameAr,
      },
    })
  } catch (error) {
    console.error("Error updating hospital:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث المستشفى" }, { status: 500 })
  }
}

// DELETE - حذف مستشفى
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const hospital = await Hospital.findByIdAndDelete(id)

    if (!hospital) {
      return NextResponse.json({ success: false, error: "المستشفى غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "تم حذف المستشفى بنجاح" })
  } catch (error) {
    console.error("Error deleting hospital:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف المستشفى" }, { status: 500 })
  }
}
