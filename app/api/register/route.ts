import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { sendMail } from '@/lib/sendMail'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, confirmPassword, role } = body as any

    // validate
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'كلمات المرور غير متطابقة' }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() }).lean()
    if (existing) {
      return NextResponse.json({ success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    // ✅ Generate OTP with 5 minutes expiration
    const code = generateCode()
    const expires = new Date(Date.now() + 5 * 60 * 1000) // ✅ 5 minutes

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      role: role || 'user',
      verified: false,
      emailVerified: false, // ✅ New users must verify email
      verificationCode: code,
      verificationAttempts: 0,
      codeExpires: expires,
      otpResendCount: 0, // ✅ Initialize resend count
      profileCompleted: false, // ✅ Needs to complete profile
    })

    const saved = await user.save()

    try {
      await sendMail(saved.email, code)
      console.log("✅ [SIGN_UP] تم إنشاء حساب جديد وإرسال OTP:", {
        email: saved.email,
        userId: saved._id.toString(),
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('❌ [SIGN_UP] Failed to send verification email after register:', {
        email: saved.email,
        error: err,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ success: true, user: { id: (saved as any)._id.toString(), email: saved.email } }, { status: 201 })
  } catch (err: any) {
    console.error('Register API error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'خطأ بالخادم' }, { status: 500 })
  }
}
