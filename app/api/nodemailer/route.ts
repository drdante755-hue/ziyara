import { NextRequest } from 'next/server'
import { sendMail } from '@/lib/sendMail'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
  console.log('API /api/nodemailer body:', body)
    const { email, code } = body
    if (!email || !code) {
      return new Response(JSON.stringify({ success: false, error: 'Missing email or code' }), { status: 400 })
    }

  await sendMail(email, String(code))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err: any) {
    console.error('API /api/test-nodemailer error:', err)
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500 })
  }
}
