// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * TYPES
 */
type TokenShape = {
  sub?: string;
  email?: string;
  role?: string; // "admin" | "user"
  emailVerified?: boolean;
  exp?: number;
  iat?: number;
};

/**
 * الصفحات العامة
 */
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verification-method",
  "/verify",
  "/verify-email",
  "/verification-forgetPassword",
  "/", // الصفحة الرئيسية عامة
  "/delivery/login",
];

const ADMIN_PREFIX = "/admin";
const USER_PREFIX = "/user";

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"));

const isStaticOrApi = (pathname: string) =>
  pathname.startsWith("/_next/") ||
  pathname.startsWith("/static/") ||
  pathname.startsWith("/favicon.ico") ||
  pathname.startsWith("/public/") ||
  pathname.startsWith("/api/");

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // تجاهل الستاتيك والـ API وملفات _next
  if (isStaticOrApi(pathname)) {
    return NextResponse.next();
  }

  // الصفحات العامة
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // جلب التوكن
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })) as TokenShape | null;

  // لو مفيش توكن => ريديركت للّوجين مع callbackUrl
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role || "user"; // افتراض: لو مش محدد اعتبره user

  // منع اليوزر (غير الأدمن) من دخول صفحات الأدمن
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (role !== "admin") {
      // مستخدم عادي - غير مسموح له بدخول صفحات الأدمن
      return NextResponse.redirect(new URL("/user/home", req.url));
    }
    return NextResponse.next();
  }

  // منع الأدمن من دخول صفحات اليوزر
  if (pathname.startsWith(USER_PREFIX)) {
    if (role === "admin") {
      // أدمن مش لازم يدخل صفحات المستخدم العادي -> ارسله للوحة الأدمن
      return NextResponse.redirect(new URL("/admin/dashboard", req.url)); // غيّر المسار لو عايز لوحة خاصة
    }

    // مثال: لو الصفحة /user/home وتتطلب emailVerified
    const isUserHome = pathname === "/user/home" || pathname.startsWith("/user/home/");
    if (isUserHome && !token.emailVerified) {
      const verifyUrl = new URL("/verify-email", req.url);
      verifyUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + (search || ""));
      return NextResponse.redirect(verifyUrl);
    }

    return NextResponse.next();
  }

  // باقي المسارات تتطلب توكن بس
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/admin/:path*", // شغّل للـ admin
    "/user/:path*",  // شغّل للـ user
    // نمط عام يستثني _next, api, favicon, public، والصفحات العامة اللي مذكورة
    "/((?!_next/static|_next/image|favicon.ico|public|api|login|register|forgot-password|verification-method|verify|verify-email|verification-forgetPassword).*)",
  ],
};
