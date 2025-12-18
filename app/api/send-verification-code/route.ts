import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendMail } from "@/lib/sendMail"

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const email = body.email || session.user.email

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // ✅ Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني متحقق بالفعل" },
        { status: 400 }
      )
    }

    // ✅ Check resend limit (max 5 resends per hour)
    const MAX_RESENDS = 5
    const RESEND_WINDOW = 60 * 60 * 1000 // 1 hour
    const now = new Date()
    
    if (user.lastOtpResendAt) {
      const timeSinceLastResend = now.getTime() - user.lastOtpResendAt.getTime()
      
      // Reset count if window expired
      if (timeSinceLastResend > RESEND_WINDOW) {
        user.otpResendCount = 0
      }
      
      // Check if limit exceeded
      if ((user.otpResendCount || 0) >= MAX_RESENDS) {
        const remainingTime = Math.ceil((RESEND_WINDOW - timeSinceLastResend) / (60 * 1000))
        return NextResponse.json(
          { 
            success: false, 
            error: `تم تجاوز الحد الأقصى لإعادة الإرسال. يرجى المحاولة بعد ${remainingTime} دقيقة` 
          },
          { status: 429 }
        )
      }
    }

    // Generate new verification code (5 minutes expiration)
    const verificationCode = generateCode()
    const codeExpires = new Date(Date.now() + 5 * 60 * 1000) // ✅ 5 minutes

    // Update user with new code
    user.verificationCode = verificationCode
    user.codeExpires = codeExpires
    user.verificationAttempts = 0
    user.otpResendCount = (user.otpResendCount || 0) + 1
    user.lastOtpResendAt = now
    await user.save()

    // Send verification email
    try {
      await sendMail(user.email, verificationCode)
      console.log("✅ [OTP_RESEND] تم إرسال رمز التحقق:", {
        email: user.email,
        resendCount: user.otpResendCount,
        timestamp: now.toISOString()
      })
    } catch (emailError) {
      console.error("❌ [OTP_RESEND] فشل إرسال رمز التحقق:", {
        email: user.email,
        error: emailError,
        timestamp: now.toISOString()
      })
      return NextResponse.json(
        { success: false, error: "فشل إرسال رمز التحقق. يرجى المحاولة لاحقاً" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال رمز التحقق بنجاح",
        resendCount: user.otpResendCount,
        remainingResends: MAX_RESENDS - user.otpResendCount,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error("❌ [OTP_RESEND] Send verification code API error:", err)
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ بالخادم" },
      { status: 500 }
    )
  }
}
