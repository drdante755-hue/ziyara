import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Specialty from "@/models/Specialty"

// GET - جلب التخصصات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    const query: any = {}
    if (active === "true") {
      query.isActive = true
    }

    const specialties = await Specialty.find(query).sort({ order: 1, nameAr: 1 }).lean()

    const transformedSpecialties = specialties.map((specialty: any) => ({
      id: specialty._id.toString(),
      name: specialty.name,
      nameAr: specialty.nameAr,
      slug: specialty.slug,
      description: specialty.description,
      descriptionAr: specialty.descriptionAr,
      icon: specialty.icon,
      image: specialty.image,
      isActive: specialty.isActive,
      order: specialty.order,
    }))

    return NextResponse.json({
      success: true,
      specialties: transformedSpecialties,
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب التخصصات" }, { status: 500 })
  }
}

// POST - إضافة تخصص جديد (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, nameAr, description, descriptionAr, icon, image, order } = body

    if (!name || !nameAr) {
      return NextResponse.json({ success: false, error: "الاسم مطلوب بالعربية والإنجليزية" }, { status: 400 })
    }

    // إنشاء slug من الاسم
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const specialty = await Specialty.create({
      name,
      nameAr,
      slug,
      description,
      descriptionAr,
      icon,
      image,
      order: order || 0,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      specialty: {
        id: specialty._id.toString(),
        name: specialty.name,
        nameAr: specialty.nameAr,
        slug: specialty.slug,
      },
    })
  } catch (error: any) {
    console.error("Error creating specialty:", error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "هذا التخصص موجود بالفعل" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "فشل في إنشاء التخصص" }, { status: 500 })
  }
}
