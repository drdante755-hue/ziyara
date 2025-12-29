import { NextResponse } from "next/server";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const mongodbUri = process.env.MONGODB_URI || "";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET || "";
  const nextAuthUrl = process.env.NEXTAUTH_URL || "";

  // --- Google Checks ---
  const googleMissing = !googleClientId || !googleClientSecret;
  const googlePlaceholder =
    googleClientId.includes("your-") ||
    googleClientSecret.includes("your-") ||
    googleClientId === "your-google-client-id.apps.googleusercontent.com" ||
    googleClientSecret === "your-google-client-secret";

  const googleConfigured = !googleMissing && !googlePlaceholder;

  // --- MongoDB ---
  const mongodbConfigured = !!mongodbUri;

  // --- NextAuth Secret ---
  const nextAuthConfigured = !!nextAuthSecret;

  // --- NextAuth URL ---
  const nextAuthUrlConfigured = nextAuthUrl.length > 0;

  const allConfigured =
    googleConfigured &&
    mongodbConfigured &&
    nextAuthConfigured &&
    nextAuthUrlConfigured;

  return NextResponse.json(
    {
      google: {
        clientIdFound: !!googleClientId,
        clientSecretFound: !!googleClientSecret,
        placeholder: googlePlaceholder,
        configured: googleConfigured,
        message: googleMissing
          ? "❌ Google OAuth غير مكتمل - يجب إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET"
          : googlePlaceholder
          ? "⚠️ القيم الحالية placeholders — يجب استبدالها بالقيم الحقيقية من Google Cloud"
          : "✅ Google OAuth معد بشكل صحيح",
      },

      mongodb: {
        configured: mongodbConfigured,
        message: mongodbConfigured
          ? "✅ اتصال MongoDB جاهز"
          : "❌ MONGODB_URI غير موجود",
      },

      nextauth: {
        secretConfigured: nextAuthConfigured,
        urlConfigured: nextAuthUrlConfigured,
        url: nextAuthUrl || "غير محدد",
        message: !nextAuthConfigured
          ? "❌ NEXTAUTH_SECRET غير موجود — مطلوب لتوقيع التوكنات"
          : !nextAuthUrlConfigured
          ? "⚠️ NEXTAUTH_URL مفقود — قد يسبب مشاكل مع Google OAuth"
          : "✅ NextAuth مضبوط بشكل صحيح",
      },

      allConfigured,

      status: allConfigured ? "success" : "error",
    },
    { status: allConfigured ? 200 : 500 }
  );
}
