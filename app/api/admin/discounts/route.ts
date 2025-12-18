import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Discount from "@/models/Discount"
import ActivityLog from "@/models/ActivityLog"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
// GET - Fetch all discounts
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const query: any = {}

    if (search) {
      query.$or = [{ code: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (status && status !== "الكل") {
      query.status = status
    }

    // Update expired discounts
    await Discount.updateMany(
      { expiryDate: { $lt: new Date() }, status: { $ne: "منتهي" } },
      { $set: { status: "منتهي" } },
    )

    const discounts = await Discount.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error("Error fetching discounts:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الخصومات" }, { status: 500 })
  }
}

// POST - Create new discount
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions);
    const body = await request.json()
    const { code, discount, type, expiryDate, maxUsage, description, minOrder } = body

    // Check if code already exists
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() })
    if (existingDiscount) {
      return NextResponse.json({ error: "كود الخصم موجود بالفعل" }, { status: 400 })
    }

    const newDiscount = await Discount.create({
      code: code.toUpperCase(),
      discount,
      type,
      expiryDate: new Date(expiryDate),
      maxUsage: maxUsage || 100,
      description,
      minOrder: minOrder || 0,
      status: "نشط",
      usageCount: 0,
    })

    // Log activity
    await ActivityLog.create({
      admin: session?.user.name || "المسؤول",
      action: "إنشاء كود خصم",
      type: "إنشاء",
      details: `أنشأ كود خصم جديد "${code.toUpperCase()}"`,
      target: "خصم",
      targetId: newDiscount._id.toString(),
    })

    return NextResponse.json({ discount: newDiscount }, { status: 201 })
  } catch (error) {
    console.error("Error creating discount:", error)
    return NextResponse.json({ error: "حدث خطأ في إنشاء الخصم" }, { status: 500 })
  }
}
