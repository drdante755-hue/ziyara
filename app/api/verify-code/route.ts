import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendMail } from '@/lib/sendMail'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, code } = body as { email?: string; code?: string }

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'email and code are required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // ✅ Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        success: false, 
        error: 'البريد الإلكتروني متحقق بالفعل' 
      }, { status: 400 })
    }

    // ✅ if code expired (5 minutes)
    const now = new Date()
    if (!user.codeExpires || user.codeExpires < now) {
      // generate and send new code
      const newCode = generateCode()
      user.verificationCode = newCode
      user.verificationAttempts = 0
      user.codeExpires = new Date(Date.now() + 5 * 60 * 1000) // ✅ 5 minutes
      await user.save()
      try { 
        await sendMail(user.email, newCode)
        console.log("⚠️ [OTP_VERIFY] انتهت صلاحية الكود، تم إرسال كود جديد:", user.email)
      } catch (e) { 
        console.error('❌ [OTP_VERIFY] Failed to resend code on expiry', e) 
      }
      return NextResponse.json({ 
        success: false, 
        message: 'انتهت صلاحية الكود. تم إرسال كود جديد.' 
      }, { status: 410 })
    }

    // ✅ if attempts exceeded (max 3 attempts)
    const MAX_ATTEMPTS = 3
    if ((user.verificationAttempts || 0) >= MAX_ATTEMPTS) {
      const newCode = generateCode()
      user.verificationCode = newCode
      user.verificationAttempts = 0
      user.codeExpires = new Date(Date.now() + 5 * 60 * 1000) // ✅ 5 minutes
      await user.save()
      try { 
        await sendMail(user.email, newCode)
        console.log("⚠️ [OTP_VERIFY] تجاوز عدد المحاولات، تم إرسال كود جديد:", user.email)
      } catch (e) { 
        console.error('❌ [OTP_VERIFY] Failed to resend code after attempts exceeded', e) 
      }
      return NextResponse.json({ 
        success: false, 
        message: 'عدد المحاولات تجاوز الحد. تم إرسال كود جديد.' 
      }, { status: 429 })
    }

    // ✅ check code
    if (user.verificationCode !== code) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1
      await user.save()
      console.log("❌ [OTP_VERIFY] كود غير صحيح:", {
        email: user.email,
        attempts: user.verificationAttempts,
        maxAttempts: MAX_ATTEMPTS
      })
      return NextResponse.json({ 
        success: false, 
        error: `الكود غير صحيح. المحاولات المتبقية: ${MAX_ATTEMPTS - user.verificationAttempts}` 
      }, { status: 401 })
    }

    // ✅ Success - set both verified and emailVerified for backward compatibility
    user.verified = true
    user.emailVerified = true // New field for email verification
    user.verificationAttempts = 0
    user.verificationCode = undefined
    user.codeExpires = undefined
    // ✅ Reset resend count on successful verification
    user.otpResendCount = 0
    user.lastOtpResendAt = undefined
    await user.save()
    
    return NextResponse.json({ success: true, message: 'تم تفعيل الحساب بنجاح' }, { status: 200 })
  } catch (err: any) {
    console.error('Verify-code API error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'خطأ بالخادم' }, { status: 500 })
  }
}
