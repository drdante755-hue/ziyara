import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Clinic from "@/models/Clinic"

// GET - جلب العيادات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const area = searchParams.get("area")
    const specialty = searchParams.get("specialty")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const clinicType = searchParams.get("clinicType")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const active = searchParams.get("active")

    const query: any = {}

    if (active === "true") {
      query.isActive = true
    }

    if (city) query.city = city
    if (area) query.area = area
    if (specialty) query.specialties = { $in: [specialty] }
    if (featured === "true") query.isFeatured = true
    if (clinicType) query.clinicType = clinicType

    const skip = (page - 1) * limit

    const [clinics, total] = await Promise.all([
      Clinic.find(query)
        .populate("medicalCenter", "name nameAr")
        .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Clinic.countDocuments(query),
    ])

    const transformedClinics = clinics.map((clinic: any) => ({
      id: clinic._id.toString(),
      _id: clinic._id.toString(),
      name: clinic.name,
      nameAr: clinic.nameAr,
      slug: clinic.slug,
      clinicType: clinic.clinicType,
      medicalCenter: clinic.medicalCenter
        ? {
            _id: clinic.medicalCenter._id.toString(),
            name: clinic.medicalCenter.name || clinic.medicalCenter.nameAr,
          }
        : null,
      description: clinic.description,
      descriptionAr: clinic.descriptionAr,
      address: clinic.address,
      city: clinic.city,
      area: clinic.area,
      phone: clinic.phone,
      email: clinic.email,
      images: clinic.images,
      logo: clinic.logo,
      specialties: clinic.specialties,
      workingHours: clinic.workingHours,
      rating: clinic.rating || 0,
      reviewsCount: clinic.reviewsCount || 0,
      isActive: clinic.isActive,
      isFeatured: clinic.isFeatured,
      amenities: clinic.amenities,
      insuranceAccepted: clinic.insuranceAccepted,
      slotDuration: clinic.slotDuration,
      startDate: clinic.startDate,
      endDate: clinic.endDate,
      defaultStartTime: clinic.defaultStartTime,
      defaultEndTime: clinic.defaultEndTime,
    }))

    return NextResponse.json({
      success: true,
      clinics: transformedClinics,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching clinics:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب العيادات" }, { status: 500 })
  }
}

// POST - إضافة عيادة جديدة
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      nameAr,
      nameEn,
      clinicType,
      medicalCenter,
      description,
      descriptionAr,
      address,
      city,
      area,
      governorate,
      phone,
      email,
      specialties,
      workingHours,
      images,
      logo,
      amenities,
      insuranceAccepted,
      isActive,
      isFeatured,
      slotDuration,
      startDate,
      endDate,
      defaultStartTime,
      defaultEndTime,
    } = body

    if (!name || !nameAr || !address || !city || !phone) {
      return NextResponse.json({ success: false, error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 })
    }

    const slug = nameAr
      .replace(/\s+/g, "-")
      .replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, "")
      .toLowerCase()

    const clinic = await Clinic.create({
      name,
      nameAr,
      slug: `${slug}-${Date.now()}`,
      clinicType: clinicType || "medical_center",
      medicalCenter: medicalCenter || undefined,
      description,
      descriptionAr,
      address,
      city,
      area,
      phone,
      email,
      specialties: specialties || [],
      workingHours: workingHours || [],
      images: images || [],
      logo,
      amenities: amenities || [],
      insuranceAccepted: insuranceAccepted || [],
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      rating: 0,
      reviewsCount: 0,
      slotDuration: slotDuration || 30,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      defaultStartTime: defaultStartTime || "09:00",
      defaultEndTime: defaultEndTime || "21:00",
    })

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic._id.toString(),
        name: clinic.name,
        nameAr: clinic.nameAr,
        slug: clinic.slug,
        clinicType: clinic.clinicType,
      },
    })
  } catch (error: any) {
    console.error("Error creating clinic:", error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "هذه العيادة موجودة بالفعل" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "فشل في إنشاء العيادة" }, { status: 500 })
  }
}
