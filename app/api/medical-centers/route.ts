import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import MedicalCenter from "@/models/MedicalCenter"
import Clinic from "@/models/Clinic"

// GET - جلب المراكز الطبية
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting medical centers GET request")
    await dbConnect()
    console.log("[v0] Database connected successfully")

    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const area = searchParams.get("area")
    const specialty = searchParams.get("specialty")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const active = searchParams.get("active")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = {}

    if (active === "true") {
      query.isActive = true
    }

    if (city) query.city = city
    if (area) query.area = area
    if (specialty) query.specialties = { $in: [specialty] }
    if (featured === "true") query.isFeatured = true

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameAr: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { descriptionAr: { $regex: search, $options: "i" } },
      ]
    }

    console.log("[v0] Query:", JSON.stringify(query))

    const skip = (page - 1) * limit

    const [centers, total] = await Promise.all([
      MedicalCenter.find(query).sort({ isFeatured: -1, rating: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      MedicalCenter.countDocuments(query),
    ])

    console.log("[v0] Found", total, "medical centers")

    const transformedCenters = centers.map((center: any) => ({
      id: center._id.toString(),
      _id: center._id.toString(),
      name: center.name,
      nameAr: center.nameAr,
      slug: center.slug,
      description: center.description,
      descriptionAr: center.descriptionAr,
      address: center.address,
      city: center.city,
      area: center.area,
      governorate: center.governorate,
      phone: center.phone,
      email: center.email,
      images: center.images,
      logo: center.logo,
      specialties: center.specialties,
      workingHours: center.workingHours,
      rating: center.rating || 0,
      reviewsCount: center.reviewsCount || 0,
      isActive: center.isActive,
      isFeatured: center.isFeatured,
      amenities: center.amenities,
      insuranceAccepted: center.insuranceAccepted,
      establishedYear: center.establishedYear,
      licenseNumber: center.licenseNumber,
      numberOfDoctors: center.numberOfDoctors,
      numberOfBeds: center.numberOfBeds,
      emergencyServices: center.emergencyServices,
      hasParking: center.hasParking,
      hasLaboratory: center.hasLaboratory,
      hasPharmacy: center.hasPharmacy,
    }))

    return NextResponse.json({
      success: true,
      centers: transformedCenters,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching medical centers:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المراكز الطبية" }, { status: 500 })
  }
}

// POST - إضافة مركز طبي جديد
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting medical centers POST request")
    await dbConnect()
    console.log("[v0] Database connected successfully")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body))

    const {
      name,
      nameAr,
      description,
      descriptionAr,
      address,
      city,
      area,
      phone,
      email,
      specialties,
      workingHours,
      images,
      logo,
      amenities,
      insuranceAccepted,
      establishedYear,
      licenseNumber,
      numberOfDoctors,
      numberOfBeds,
      emergencyServices,
      hasParking,
      hasLaboratory,
      hasPharmacy,
    } = body

    if (!name || !nameAr || !address || !city || !area || !phone) {
      return NextResponse.json({ success: false, error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 })
    }

    const slug = nameAr
      .replace(/\s+/g, "-")
      .replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, "")
      .toLowerCase()

    const center = await MedicalCenter.create({
      name,
      nameAr,
      slug: `${slug}-${Date.now()}`,
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
      isActive: true,
      isFeatured: false,
      rating: 0,
      reviewsCount: 0,
      establishedYear,
      licenseNumber,
      numberOfDoctors: numberOfDoctors || 0,
      numberOfBeds: numberOfBeds || 0,
      emergencyServices: emergencyServices || false,
      hasParking: hasParking || false,
      hasLaboratory: hasLaboratory || false,
      hasPharmacy: hasPharmacy || false,
    })

    // If clinicIds provided, attach those clinics to this new center
    try {
      const clinicIds = body.clinicIds
      if (Array.isArray(clinicIds) && clinicIds.length > 0) {
        await Clinic.updateMany({ _id: { $in: clinicIds } }, { $set: { medicalCenter: center._id } })
      }
    } catch (err) {
      console.error("Error attaching clinics to new center:", err)
    }

    return NextResponse.json({
      success: true,
      center: {
        id: center._id.toString(),
        name: center.name,
        nameAr: center.nameAr,
        slug: center.slug,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error creating medical center:", error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "هذا المركز الطبي موجود بالفعل" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "فشل في إنشاء المركز الطبي" }, { status: 500 })
  }
}
