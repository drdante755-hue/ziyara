import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Hospital from "@/models/Hospital"

// GET - جلب المستشفيات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const area = searchParams.get("area")
    const specialty = searchParams.get("specialty")
    const department = searchParams.get("department")
    const search = searchParams.get("search")
    const hasEmergency = searchParams.get("hasEmergency")
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = { isActive: true }

    if (city) query.city = city
    if (area) query.area = area
    if (specialty) query.specialties = { $in: [specialty] }
    if (department) query.departments = { $in: [department] }
    if (hasEmergency === "true") query.hasEmergency = true
    if (featured === "true") query.isFeatured = true

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameAr: { $regex: search, $options: "i" } },
        { specialties: { $regex: search, $options: "i" } },
        { departments: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [hospitals, total] = await Promise.all([
      Hospital.find(query).sort({ isFeatured: -1, rating: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hospital.countDocuments(query),
    ])

    const transformedHospitals = hospitals.map((hospital: any) => ({
      id: hospital._id.toString(),
      name: hospital.name,
      nameAr: hospital.nameAr,
      slug: hospital.slug,
      description: hospital.description,
      descriptionAr: hospital.descriptionAr,
      address: hospital.address,
      city: hospital.city,
      area: hospital.area,
      phone: hospital.phone,
      emergencyPhone: hospital.emergencyPhone,
      email: hospital.email,
      website: hospital.website,
      images: hospital.images,
      logo: hospital.logo,
      departments: hospital.departments,
      specialties: hospital.specialties,
      workingHours: hospital.workingHours,
      hasEmergency: hospital.hasEmergency,
      hasICU: hospital.hasICU,
      hasPharmacy: hospital.hasPharmacy,
      hasLab: hospital.hasLab,
      bedCount: hospital.bedCount,
      rating: hospital.rating,
      reviewsCount: hospital.reviewsCount,
      isFeatured: hospital.isFeatured,
      amenities: hospital.amenities,
      insuranceAccepted: hospital.insuranceAccepted,
      accreditations: hospital.accreditations,
    }))

    return NextResponse.json({
      success: true,
      hospitals: transformedHospitals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المستشفيات" }, { status: 500 })
  }
}

// POST - إضافة مستشفى جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      nameAr,
      address,
      city,
      area,
      phone,
      emergencyPhone,
      email,
      website,
      departments,
      specialties,
      workingHours,
      images,
      logo,
      hasEmergency,
      hasICU,
      hasPharmacy,
      hasLab,
      bedCount,
      amenities,
      insuranceAccepted,
      accreditations,
    } = body

    if (!name || !nameAr || !address || !city || !area || !phone) {
      return NextResponse.json({ success: false, error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 })
    }

    const slug = nameAr
      .replace(/\s+/g, "-")
      .replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, "")
      .toLowerCase()

    const hospital = await Hospital.create({
      name,
      nameAr,
      slug: `${slug}-${Date.now()}`,
      address,
      city,
      area,
      phone,
      emergencyPhone,
      email,
      website,
      departments: departments || [],
      specialties: specialties || [],
      workingHours: workingHours || [],
      images: images || [],
      logo,
      hasEmergency: hasEmergency || false,
      hasICU: hasICU || false,
      hasPharmacy: hasPharmacy || false,
      hasLab: hasLab || false,
      bedCount,
      amenities: amenities || [],
      insuranceAccepted: insuranceAccepted || [],
      accreditations: accreditations || [],
      isActive: true,
      isFeatured: false,
      rating: 0,
      reviewsCount: 0,
    })

    return NextResponse.json({
      success: true,
      hospital: {
        id: hospital._id.toString(),
        name: hospital.name,
        nameAr: hospital.nameAr,
        slug: hospital.slug,
      },
    })
  } catch (error: any) {
    console.error("Error creating hospital:", error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "هذا المستشفى موجود بالفعل" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "فشل في إنشاء المستشفى" }, { status: 500 })
  }
}
