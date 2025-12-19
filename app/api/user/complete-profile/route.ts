import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function POST(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "غير مصرح لك" }, { status: 401 })
    }

    await dbConnect()

    // البحث عن المستخدم
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    // التحقق من أن البريد الإلكتروني تم التحقق منه
    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: "يجب التحقق من البريد الإلكتروني أولاً" }, { status: 403 })
    }

    // قراءة البيانات من الطلب
    const body = await request.json()
    const { firstName, lastName, age, phone, address, email } = body

    // التحقق من صحة البيانات
    const errors: string[] = []

    if (!firstName || firstName.trim().length < 2) {
      errors.push("الاسم الأول يجب أن يكون أكثر من حرف واحد")
    }

    if (!lastName || lastName.trim().length < 2) {
      errors.push("الاسم الأخير يجب أن يكون أكثر من حرف واحد")
    }

    const ageNum = Number.parseInt(age)
    if (!age || isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      errors.push("العمر يجب أن يكون بين 16 و 100 سنة")
    }

    const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ""))) {
      errors.push("رقم الهاتف غير صحيح (يجب أن يكون رقم مصري صحيح)")
    }

    if (!address || address.trim().length < 10) {
      errors.push("العنوان يجب أن يكون على الأقل 10 أحرف")
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    // تحديث بيانات المستخدم
    user.firstName = firstName.trim()
    user.lastName = lastName.trim()
    user.age = ageNum
    user.phone = phone.trim()
    user.address = address.trim()
    user.profileCompleted = true

    // حفظ البريد الإلكتروني إذا تم توفيره
    if (email && email !== user.email) {
      user.email = email.trim()
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: "تم حفظ البيانات بنجاح",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        age: user.age,
        profileCompleted: user.profileCompleted,
      },
    })
  } catch (error: any) {
    console.error("Error completing profile:", error)
    return NextResponse.json({ success: false, error: error?.message || "فشل في حفظ البيانات" }, { status: 500 })
  }
}
