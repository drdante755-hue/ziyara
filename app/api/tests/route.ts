import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Test } from "@/models/Service"

// GET - جلب التحاليل النشطة للمستخدمين
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // فقط التحاليل النشطة للمستخدمين
    const filter: any = { isActive: true }

    if (category && category !== "الكل") {
      filter.category = category
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]
    }

    const tests = await Test.find(filter).sort({ createdAt: -1 }).lean()

    // جلب الفئات المتاحة
    const categories = await Test.distinct("category", { isActive: true })

    return NextResponse.json({
      success: true,
      data: tests,
      categories,
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب التحاليل" }, { status: 500 })
  }
}
