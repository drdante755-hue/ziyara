import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Provider from "@/models/Provider"

// GET - جلب الأطباء
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get("specialty")
    const clinicId = searchParams.get("clinicId")
    const medicalCenterId = searchParams.get("medicalCenterId")
    const gender = searchParams.get("gender")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const availableForHomeVisit = searchParams.get("homeVisit")
    const availableForOnline = searchParams.get("online")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = { isActive: true }

    if (specialty) query.specialty = specialty
    if (clinicId) query.clinicId = clinicId
    if (medicalCenterId) query.medicalCenterId = medicalCenterId
    if (gender) query.gender = gender
    if (featured === "true") query.isFeatured = true
    if (availableForHomeVisit === "true") query.availableForHomeVisit = true
    if (availableForOnline === "true") query.availableForOnline = true

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameAr: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
        { specialtyAr: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [providers, total] = await Promise.all([
      Provider.find(query)
        .populate("clinicId", "name nameAr")
        .populate("medicalCenterId", "name nameAr")
        .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Provider.countDocuments(query),
    ])

    const transformedProviders = providers.map((provider: any) => ({
      id: provider._id.toString(),
      name: provider.name,
      nameAr: provider.nameAr,
      slug: provider.slug,
      title: provider.title,
      titleAr: provider.titleAr,
      specialty: provider.specialty,
      specialtyAr: provider.specialtyAr,
      subSpecialties: provider.subSpecialties,
      bio: provider.bio,
      bioAr: provider.bioAr,
      image: provider.image || `/placeholder.svg?height=200&width=200&query=doctor ${provider.gender}`,
      // include contact and status fields so admin UI can display saved values
      phone: provider.phone,
      email: provider.email,
      clinic: provider.clinicId,
      medicalCenter: provider.medicalCenterId,
      clinicId: provider.clinicId?._id?.toString() || provider.clinicId,
      medicalCenterId: provider.medicalCenterId?._id?.toString() || provider.medicalCenterId,
      isActive: typeof provider.isActive === "boolean" ? provider.isActive : true,
      gender: provider.gender,
      languages: provider.languages,
      education: provider.education,
      experience: provider.experience,
      consultationFee: provider.consultationFee,
      followUpFee: provider.followUpFee,
      workingAt: provider.workingAt,
      rating: provider.rating,
      reviewsCount: provider.reviewsCount,
      totalPatients: provider.totalPatients,
      isFeatured: provider.isFeatured,
      isVerified: provider.isVerified,
      availableForHomeVisit: provider.availableForHomeVisit,
      homeVisitFee: provider.homeVisitFee,
      availableForOnline: provider.availableForOnline,
      onlineConsultationFee: provider.onlineConsultationFee,
      availability: provider.availability,
      receptionType: provider.receptionType || "open",
      receptionCapacity: typeof provider.receptionCapacity === "number" ? provider.receptionCapacity : null,
    }))

    return NextResponse.json({
      success: true,
      providers: transformedProviders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching providers:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الأطباء" }, { status: 500 })
  }
}

// POST - إضافة طبيب جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      nameAr,
      title,
      titleAr,
      specialty,
      specialtyAr,
      subSpecialties,
      bio,
      bioAr,
      email,
      phone,
      image,
      gender,
      languages,
      education,
      experience,
      consultationFee,
      followUpFee,
      clinicId,
      medicalCenterId,
      workingAt,
      availableForHomeVisit,
      homeVisitFee,
      availableForOnline,
      onlineConsultationFee,
      availability,
      receptionType,
      receptionCapacity,
    } = body

    if (!name || !nameAr || !title || !titleAr || !specialty || !specialtyAr || !gender || !consultationFee) {
      return NextResponse.json({ success: false, error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 })
    }

    if (receptionType === "limited" && (typeof receptionCapacity !== "number" || receptionCapacity <= 0)) {
      return NextResponse.json({ success: false, error: "عند اختيار 'محدّد' يجب تحديد سعة استقبال صحيحة" }, { status: 400 })
    }

    const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`

    const provider = await Provider.create({
      name,
      nameAr,
      slug,
      title,
      titleAr,
      specialty,
      specialtyAr,
      subSpecialties: subSpecialties || [],
      bio,
      bioAr,
      email,
      phone,
      image,
      gender,
      languages: languages || ["العربية"],
      education: education || [],
      experience: experience || 0,
      consultationFee,
      followUpFee,
      clinicId,
      medicalCenterId,
      workingAt: workingAt || [],
      availableForHomeVisit: availableForHomeVisit || false,
      homeVisitFee,
      availableForOnline: availableForOnline || false,
      onlineConsultationFee,
      isActive: true,
      isFeatured: false,
      isVerified: false,
      rating: 0,
      reviewsCount: 0,
      totalPatients: 0,
      availability: availability || {},
      receptionType: receptionType || "open",
      receptionCapacity: receptionType === "limited" ? receptionCapacity : null,
    })

    return NextResponse.json({
      success: true,
      provider: {
        id: provider._id.toString(),
        name: provider.name,
        nameAr: provider.nameAr,
        slug: provider.slug,
      },
    })
  } catch (error: any) {
    console.error("Error creating provider:", error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "هذا الطبيب موجود بالفعل" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "فشل في إنشاء الطبيب" }, { status: 500 })
  }
}
