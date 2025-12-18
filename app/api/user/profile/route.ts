import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Order from "@/models/Order"
import Discount from "@/models/Discount"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "غير مصرح لك" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email }).lean()

    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    // جلب طلبات المستخدم
    const orders = await Order.find({
      $or: [{ customerEmail: session.user.email }, { customerPhone: user.phone }],
    })
      .sort({ createdAt: -1 })
      .lean()

    // حساب الإحصائيات
    const completedOrders = orders.filter((o) => o.status === "delivered")
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const savedAmount = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0)
    const loyaltyPoints = Math.floor(totalSpent / 10) // نقطة لكل 10 جنيه

    // جلب أكواد الخصم المتاحة
    const discounts = await Discount.find({
      isActive: true,
      $or: [{ endDate: { $gte: new Date() } }, { endDate: null }],
    }).lean()

    // الحد المطلوب لفتح بطاقات الخصم
    const requiredForDiscount = 1500
    const discountUnlocked = totalSpent >= requiredForDiscount

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        age: user.age,
        createdAt: user.createdAt,
        profileCompleted: user.profileCompleted,
        emailVerified: user.emailVerified,
      },
      stats: {
        totalSpent,
        completedOrders: completedOrders.length,
        totalOrders: orders.length,
        loyaltyPoints,
        savedAmount,
        requiredForDiscount,
        discountUnlocked,
        progressPercentage: Math.min((totalSpent / requiredForDiscount) * 100, 100),
        remainingAmount: Math.max(requiredForDiscount - totalSpent, 0),
      },
      orders: orders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        items: order.items,
        discountAmount: order.discountAmount || 0,
        discountCode: order.discountCode || null,
      })),
      discounts: discountUnlocked
        ? discounts.map((d) => ({
            _id: d._id,
            code: d.code,
            name: d.name,
            description: d.description,
            discountType: d.discountType,
            discountValue: d.discountValue,
            minOrderAmount: d.minOrderAmount,
            maxDiscountAmount: d.maxDiscountAmount,
            category: d.category,
            endDate: d.endDate,
            usageLimit: d.usageLimit,
            usedCount: d.usedCount,
          }))
        : [],
    })
  } catch (err: any) {
    console.error("Profile API error:", err)
    return NextResponse.json({ success: false, error: err?.message || "خطأ بالخادم" }, { status: 500 })
  }
}

// تحديث بيانات المستخدم
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "غير مصرح لك" }, { status: 401 })
    }

    await dbConnect()
    const body = await req.json()

    const allowedFields = ["firstName", "lastName", "phone", "address", "age"]
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const user = await User.findOneAndUpdate({ email: session.user.email }, { $set: updateData }, { new: true }).lean()

    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم ��حديث البيانات بنجاح",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        age: user.age,
      },
    })
  } catch (err: any) {
    console.error("Update profile API error:", err)
    return NextResponse.json({ success: false, error: err?.message || "خطأ بالخادم" }, { status: 500 })
  }
}
