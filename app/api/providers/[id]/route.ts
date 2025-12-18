import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Provider from "@/models/Provider"

// GET - جلب طبيب معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const provider = await Provider.findById(id).lean()

    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: (provider as any)._id.toString(),
        name: (provider as any).name,
        nameAr: (provider as any).nameAr,
        slug: (provider as any).slug,
        title: (provider as any).title,
        titleAr: (provider as any).titleAr,
        specialty: (provider as any).specialty,
        specialtyAr: (provider as any).specialtyAr,
        subSpecialties: (provider as any).subSpecialties,
        bio: (provider as any).bio,
        bioAr: (provider as any).bioAr,
        email: (provider as any).email,
        phone: (provider as any).phone,
        image: (provider as any).image,
        gender: (provider as any).gender,
        languages: (provider as any).languages,
        education: (provider as any).education,
        experience: (provider as any).experience,
        consultationFee: (provider as any).consultationFee,
        followUpFee: (provider as any).followUpFee,
        workingAt: (provider as any).workingAt,
        rating: (provider as any).rating,
        reviewsCount: (provider as any).reviewsCount,
        totalPatients: (provider as any).totalPatients,
        isActive: (provider as any).isActive,
        isFeatured: (provider as any).isFeatured,
        isVerified: (provider as any).isVerified,
        availableForHomeVisit: (provider as any).availableForHomeVisit,
        homeVisitFee: (provider as any).homeVisitFee,
        availableForOnline: (provider as any).availableForOnline,
        onlineConsultationFee: (provider as any).onlineConsultationFee,
      },
    })
  } catch (error) {
    console.error("Error fetching provider:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الطبيب" }, { status: 500 })
  }
}

// PUT - تحديث طبيب
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const provider = await Provider.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()

    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: (provider as any)._id.toString(),
        name: (provider as any).name,
        nameAr: (provider as any).nameAr,
      },
    })
  } catch (error) {
    console.error("Error updating provider:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث الطبيب" }, { status: 500 })
  }
}

// DELETE - حذف طبيب
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const provider = await Provider.findByIdAndDelete(id)

    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "تم حذف الطبيب بنجاح" })
  } catch (error) {
    console.error("Error deleting provider:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف الطبيب" }, { status: 500 })
  }
}
