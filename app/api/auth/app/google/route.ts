import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL!;

  return NextResponse.redirect(
    `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(
      baseUrl
    )}`
  );
}
