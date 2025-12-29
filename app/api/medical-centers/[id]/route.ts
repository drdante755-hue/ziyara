import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import MedicalCenter from "@/models/MedicalCenter"
import Clinic from "@/models/Clinic"

// GET - جلب مركز طبي معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const center = await MedicalCenter.findById(id).lean()

    if (!center) {
      return NextResponse.json({ success: false, error: "المركز الطبي غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      center: {
        id: (center as any)._id.toString(),
        name: (center as any).name,
        nameAr: (center as any).nameAr,
        slug: (center as any).slug,
        description: (center as any).description,
        descriptionAr: (center as any).descriptionAr,
        address: (center as any).address,
        city: (center as any).city,
        area: (center as any).area,
        phone: (center as any).phone,
        email: (center as any).email,
        images: (center as any).images,
        logo: (center as any).logo,
        specialties: (center as any).specialties,
        workingHours: (center as any).workingHours,
        rating: (center as any).rating,
        reviewsCount: (center as any).reviewsCount,
        isActive: (center as any).isActive,
        isFeatured: (center as any).isFeatured,
        amenities: (center as any).amenities,
        insuranceAccepted: (center as any).insuranceAccepted,
        establishedYear: (center as any).establishedYear,
        licenseNumber: (center as any).licenseNumber,
        numberOfDoctors: (center as any).numberOfDoctors,
        numberOfBeds: (center as any).numberOfBeds,
        emergencyServices: (center as any).emergencyServices,
        hasParking: (center as any).hasParking,
        hasLaboratory: (center as any).hasLaboratory,
        hasPharmacy: (center as any).hasPharmacy,
      },
    })
  } catch (error) {
    console.error("Error fetching medical center:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المركز الطبي" }, { status: 500 })
  }
}

// PUT - تحديث مركز طبي
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const updateData = { ...body }

    // remove clinicIds from direct center update payload
    const clinicIds = Array.isArray(updateData.clinicIds) ? updateData.clinicIds : undefined
    if (clinicIds) delete updateData.clinicIds

    const center = await MedicalCenter.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean()

    if (!center) {
      return NextResponse.json({ success: false, error: "المركز الطبي غير موجود" }, { status: 404 })
    }

    // If clinicIds provided, attach/detach clinics accordingly
    try {
      if (clinicIds) {
        // attach selected clinics
        await Clinic.updateMany({ _id: { $in: clinicIds } }, { $set: { medicalCenter: center._id } })

        // detach clinics that were linked to this center but not selected
        await Clinic.updateMany({ medicalCenter: center._id, _id: { $nin: clinicIds } }, { $unset: { medicalCenter: "" } })
      }
    } catch (err) {
      console.error("Error updating clinic links for center:", err)
    }

    return NextResponse.json({
      success: true,
      center: {
        id: (center as any)._id.toString(),
        name: (center as any).name,
        nameAr: (center as any).nameAr,
      },
    })
  } catch (error) {
    console.error("Error updating medical center:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث المركز الطبي" }, { status: 500 })
  }
}

// DELETE - حذف مركز طبي
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const center = await MedicalCenter.findByIdAndDelete(id)

    if (!center) {
      return NextResponse.json({ success: false, error: "المركز الطبي غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "تم حذف المركز الطبي بنجاح" })
  } catch (error) {
    console.error("Error deleting medical center:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف المركز الطبي" }, { status: 500 })
  }
}
