import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { TestRequest, Test } from "@/models/Service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

// POST - إنشاء طلب تحليل جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    // التحقق من البيانات المطلوبة
    if (!body.patientName || !body.phone || !body.address || !body.tests || body.tests.length === 0) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    // حساب السعر الإجمالي
    const testsData = await Test.find({ _id: { $in: body.tests } })
    const totalPrice = testsData.reduce((sum, test) => sum + test.price, 0)
    const testNames = testsData.map((test) => test.name)

    // إنشاء الطلب
    const testRequest = await TestRequest.create({
      patientName: body.patientName,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      address: body.address,
      tests: testNames,
      totalPrice,
      date: body.date,
      time: body.time || "غير محدد",
      notes: body.notes,
      status: "جاري",
    })

    return NextResponse.json({
      success: true,
      data: testRequest,
      message: "تم حجز التحليل بنجاح",
    })
  } catch (error) {
    console.error("Error creating test request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حجز التحليل" }, { status: 500 })
  }
}

// GET - جلب طلبات التحاليل للمستخدم الحالي
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    const filter: any = {}

    if (phone) {
      filter.phone = phone
    }

    const requests = await TestRequest.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("Error fetching test requests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
