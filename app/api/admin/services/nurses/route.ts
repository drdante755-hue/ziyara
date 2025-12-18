import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Nurse } from "@/models/Service"

// GET - جلب جميع الممرضات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const available = searchParams.get("available")
    const search = searchParams.get("search")

    const filter: any = {}

    if (available !== null && available !== "الكل") {
      filter.available = available === "true"
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { specialty: { $regex: search, $options: "i" } }]
    }

    const nurses = await Nurse.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: nurses,
    })
  } catch (error) {
    console.error("Error fetching nurses:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الممرضات" }, { status: 500 })
  }
}

// POST - إضافة ممرضة جديدة
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.name || !body.specialty || !body.phone) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const nurse = await Nurse.create({
      name: body.name,
      specialty: body.specialty,
      experience: body.experience || "غير محدد",
      phone: body.phone,
      available: body.available ?? true,
      imageUrl: body.imageUrl,
      price: body.price || 150,
      location: body.location,
      rating: body.rating || 4.5,
      reviews: body.reviews || 0,
    })

    return NextResponse.json({
      success: true,
      data: nurse,
      message: "تمت إضافة الممرض بنجاح",
    })
  } catch (error) {
    console.error("Error creating nurse:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة الممرض" }, { status: 500 })
  }
}
