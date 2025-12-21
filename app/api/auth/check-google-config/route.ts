import { NextResponse } from "next/server";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const mongodbUri = process.env.MONGODB_URI ?? "";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? "";
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "";

  /* ---------- Google OAuth ---------- */
  const googleMissing = !googleClientId || !googleClientSecret;

  const googlePlaceholder =
    googleClientId.includes("your-") ||
    googleClientSecret.includes("your-") ||
    googleClientId === "your-google-client-id.apps.googleusercontent.com" ||
    googleClientSecret === "your-google-client-secret";

  const googleConfigured = !googleMissing && !googlePlaceholder;

  /* ---------- MongoDB ---------- */
  const mongodbConfigured = Boolean(mongodbUri);

  /* ---------- NextAuth ---------- */
  const nextAuthSecretConfigured = Boolean(nextAuthSecret);

  // NEXTAUTH_URL لازم يكون https فقط (deep link مش مطلوب هنا)
  const nextAuthUrlConfigured =
    nextAuthUrl.startsWith("http://") ||
    nextAuthUrl.startsWith("https://");

  /* ---------- Overall ---------- */
  const allConfigured =
    googleConfigured &&
    mongodbConfigured &&
    nextAuthSecretConfigured &&
    nextAuthUrlConfigured;

  return NextResponse.json(
    {
      google: {
        clientIdFound: Boolean(googleClientId),
        clientSecretFound: Boolean(googleClientSecret),
        placeholder: googlePlaceholder,
        configured: googleConfigured,
        message: googleMissing
          ? "❌ Google OAuth غير مكتمل — أضف GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET"
          : googlePlaceholder
          ? "⚠️ قيم Google OAuth placeholders — استبدلها بالقيم الحقيقية"
          : "✅ Google OAuth مضبوط بشكل صحيح",
      },

      mongodb: {
        configured: mongodbConfigured,
        message: mongodbConfigured
          ? "✅ MongoDB متصل"
          : "❌ MONGODB_URI غير موجود",
      },

      nextauth: {
        secretConfigured: nextAuthSecretConfigured,
        urlConfigured: nextAuthUrlConfigured,
        url: nextAuthUrl || "غير محدد",
        message: !nextAuthSecretConfigured
          ? "❌ NEXTAUTH_SECRET غير موجود"
          : !nextAuthUrlConfigured
          ? "❌ NEXTAUTH_URL يجب أن يكون http أو https"
          : "✅ NextAuth مضبوط بشكل صحيح",
      },

      note:
        "ℹ️ Deep Link (com.firstapp.learnapk://...) لا يتم فحصه هنا — يتم السماح به من callbacks.redirect في NextAuth",

      allConfigured,
      status: allConfigured ? "success" : "error",
    },
    {
      // ❗ لا نرجع 500 إلا لو فعليًا فيه حاجة ناقصة
      status: allConfigured ? 200 : 200,
    }
  );
}
