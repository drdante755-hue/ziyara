import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Test } from "@/models/Service"

// GET - جلب جميع التحاليل
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")

    const filter: any = {}

    if (category && category !== "الكل") {
      filter.category = category
    }

    if (isActive !== null && isActive !== "الكل") {
      filter.isActive = isActive === "true"
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]
    }

    const tests = await Test.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: tests,
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب التحاليل" }, { status: 500 })
  }
}

// POST - إضافة تحليل جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const test = await Test.create({
      name: body.name,
      price: body.price,
      category: body.category,
      duration: body.duration || "غير محدد",
      description: body.description,
      isActive: body.isActive ?? true,
    })

    return NextResponse.json({
      success: true,
      data: test,
      message: "تمت إضافة التحليل بنجاح",
    })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة التحليل" }, { status: 500 })
  }
}
