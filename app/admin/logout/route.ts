import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // حذف جميع الـ cookies المتعلقة بالجلسة
  const response = NextResponse.redirect(new URL("/login", request.url))
  response.cookies.delete("adminSession")
  response.cookies.delete("next-auth.session-token")
  response.cookies.delete("next-auth.csrf-token")
  return response
}
