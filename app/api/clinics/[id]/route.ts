import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Clinic from "@/models/Clinic"

// GET - جلب عيادة معينة
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const clinic = await Clinic.findById(id).populate("medicalCenter", "name nameAr").lean()

    if (!clinic) {
      return NextResponse.json({ success: false, error: "العيادة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      clinic: {
        id: (clinic as any)._id.toString(),
        _id: (clinic as any)._id.toString(),
        name: (clinic as any).name,
        nameAr: (clinic as any).nameAr,
        slug: (clinic as any).slug,
        clinicType: (clinic as any).clinicType,
        medicalCenter: (clinic as any).medicalCenter
          ? {
              _id: (clinic as any).medicalCenter._id.toString(),
              name: (clinic as any).medicalCenter.name || (clinic as any).medicalCenter.nameAr,
            }
          : null,
        description: (clinic as any).description,
        descriptionAr: (clinic as any).descriptionAr,
        address: (clinic as any).address,
        city: (clinic as any).city,
        area: (clinic as any).area,
        phone: (clinic as any).phone,
        email: (clinic as any).email,
        images: (clinic as any).images,
        logo: (clinic as any).logo,
        specialties: (clinic as any).specialties,
        workingHours: (clinic as any).workingHours,
        rating: (clinic as any).rating || 0,
        reviewsCount: (clinic as any).reviewsCount || 0,
        isActive: (clinic as any).isActive,
        isFeatured: (clinic as any).isFeatured,
        amenities: (clinic as any).amenities,
        insuranceAccepted: (clinic as any).insuranceAccepted,
        slotDuration: (clinic as any).slotDuration,
        startDate: (clinic as any).startDate,
        endDate: (clinic as any).endDate,
        defaultStartTime: (clinic as any).defaultStartTime,
        defaultEndTime: (clinic as any).defaultEndTime,
      },
    })
  } catch (error) {
    console.error("Error fetching clinic:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب العيادة" }, { status: 500 })
  }
}

// PUT - تحديث عيادة
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    if (body.medicalCenter === "") {
      body.medicalCenter = undefined
    }

    const clinic = await Clinic.findByIdAndUpdate(id, { $set: body }, { new: true })
      .populate("medicalCenter", "name nameAr")
      .lean()

    if (!clinic) {
      return NextResponse.json({ success: false, error: "العيادة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      clinic: {
        id: (clinic as any)._id.toString(),
        _id: (clinic as any)._id.toString(),
        name: (clinic as any).name,
        nameAr: (clinic as any).nameAr,
        medicalCenter: (clinic as any).medicalCenter
          ? {
              _id: (clinic as any).medicalCenter._id.toString(),
              name: (clinic as any).medicalCenter.name || (clinic as any).medicalCenter.nameAr,
            }
          : null,
        slotDuration: (clinic as any).slotDuration,
        startDate: (clinic as any).startDate,
        endDate: (clinic as any).endDate,
        defaultStartTime: (clinic as any).defaultStartTime,
        defaultEndTime: (clinic as any).defaultEndTime,
      },
    })
  } catch (error) {
    console.error("Error updating clinic:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث العيادة" }, { status: 500 })
  }
}

// DELETE - حذف عيادة
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const clinic = await Clinic.findByIdAndDelete(id)

    if (!clinic) {
      return NextResponse.json({ success: false, error: "العيادة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "تم حذف العيادة بنجاح" })
  } catch (error) {
    console.error("Error deleting clinic:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف العيادة" }, { status: 500 })
  }
}
