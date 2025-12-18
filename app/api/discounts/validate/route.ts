import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Discount from "@/models/Discount"

// POST - Validate a discount code
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 })
    }

    const discount = await Discount.findOne({ code: code.toUpperCase() })

    if (!discount) {
      return NextResponse.json({ error: "كود الخصم غير صالح" }, { status: 404 })
    }

    // Check if discount is active
    if (discount.status !== "نشط") {
      return NextResponse.json({ error: "كود الخصم غير نشط" }, { status: 400 })
    }

    // Check if discount has expired
    if (new Date(discount.expiryDate) < new Date()) {
      return NextResponse.json({ error: "كود الخصم منتهي الصلاحية" }, { status: 400 })
    }

    // Check if discount has reached max usage
    if (discount.usageCount >= discount.maxUsage) {
      return NextResponse.json({ error: "تم استنفاد عدد استخدامات هذا الكود" }, { status: 400 })
    }

    // Check minimum order amount
    if (subtotal && discount.minOrder > 0 && subtotal < discount.minOrder) {
      return NextResponse.json({ error: `الحد الأدنى للطلب ${discount.minOrder} ج.م` }, { status: 400 })
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.type === "%") {
      discountAmount = (subtotal * discount.discount) / 100
    } else {
      discountAmount = discount.discount
    }

    return NextResponse.json({
      valid: true,
      discount: {
        _id: discount._id,
        code: discount.code,
        discount: discount.discount,
        type: discount.type,
        description: discount.description,
        minOrder: discount.minOrder,
        discountAmount: discountAmount,
      },
    })
  } catch (error) {
    console.error("Error validating discount:", error)
    return NextResponse.json({ error: "حدث خطأ في التحقق من كود الخصم" }, { status: 500 })
  }
}
