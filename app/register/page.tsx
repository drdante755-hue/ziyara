"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, User, Lock, Heart, Stethoscope, LogIn } from "lucide-react";
import EnhancedFloatingMedicalIcons from "@/components/enhanced-floating-medical-icons";
import LoadingOverlay from "@/components/ui/loading-overlay";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Use register API to create account
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل التسجيل");
        setIsLoading(false);
        return;
      }

      // ✅ After successful registration, sign in and redirect to verify-email
      const signInResult = await signIn("credentials", {
        redirect: false,
        emailOrPhone: formData.email,
        password: formData.password,
      });

      if (signInResult?.ok) {
        // ✅ Redirect to verify-email page (not /verify)
        router.push("/verify-email");
      } else {
        setError("تم إنشاء الحساب لكن فشل تسجيل الدخول. يرجى تسجيل الدخول يدوياً");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("register error:", err);
      setError(err?.message || "حدث خطأ أثناء التسجيل");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      // التحقق من إعدادات Google OAuth
      let config;
      try {
        const configCheck = await fetch("/api/auth/check-google-config");
        config = await configCheck.json();
      } catch (configError) {
        console.error("Error checking config:", configError);
        // إذا فشل التحقق، جرب تسجيل الدخول مباشرة
      }
      
      if (config && !config.google?.configured) {
        let errorMsg = "إعدادات Google OAuth غير مكتملة.\n\n";
        
        if (config.google?.isPlaceholder) {
          errorMsg += "⚠️ القيم الحالية في .env.local هي placeholder values.\n\n";
          errorMsg += "يرجى:\n";
          errorMsg += "1. الحصول على Google OAuth credentials من Google Cloud Console\n";
          errorMsg += "2. استبدال القيم في ملف .env.local:\n";
          errorMsg += "   GOOGLE_CLIENT_ID=your-actual-client-id\n";
          errorMsg += "   GOOGLE_CLIENT_SECRET=your-actual-client-secret\n";
          errorMsg += "3. إعادة تشغيل السيرفر (Ctrl+C ثم npm run dev)\n";
          errorMsg += "4. التحقق من الإعدادات في: /admin/check-env";
        } else {
          errorMsg += "يرجى:\n";
          errorMsg += "1. إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في ملف .env.local\n";
          errorMsg += "2. إعادة تشغيل السيرفر\n";
          errorMsg += "3. التحقق من الإعدادات في: /admin/check-env";
        }
        
        setError(errorMsg);
        setIsLoading(false);
        return;
      }
      
      // ✅ من صفحة Register: التوجيه إلى verify-email بعد Google OAuth
      // صفحة verify-email ستحقق من الحالة الفعلية وتوجه المستخدم حسب الحاجة
      const result = await signIn("google", { 
        redirect: false,
        callbackUrl: "/verify-email" 
      });
      
      if (result?.error) {
        console.error("Google Sign-In error:", result.error);
        
        // رسائل خطأ أكثر وضوحاً
        let errorMessage = "فشل تسجيل الدخول عبر Google";
        if (result.error.includes("redirect_uri_mismatch")) {
          errorMessage = "خطأ في إعدادات Google OAuth. تأكد من إضافة redirect URI في Google Cloud Console";
        } else if (result.error.includes("invalid_client")) {
          errorMessage = "خطأ في بيانات Google OAuth. تحقق من GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET";
        } else if (result.error.includes("access_denied")) {
          errorMessage = "تم رفض الوصول. تأكد من إعداد OAuth consent screen بشكل صحيح";
        } else if (result.error.includes("OAuthCallback") || result.error.includes("JWT expired")) {
          errorMessage = "انتهت صلاحية الجلسة. يرجى المحاولة مرة أخرى";
        }
        
        setError(errorMessage);
        setIsLoading(false);
      } else if (result?.ok) {
        // ✅ من Register: التوجيه إلى verify-email (سيتحقق من الحالة الفعلية)
        router.push("/verify-email");
      } else {
        // في حالة عدم وجود نتيجة واضحة، استخدم redirect: true
        await signIn("google", { 
          redirect: true,
          callbackUrl: "/verify-email" 
        });
      }
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setError(err?.message || "فشل تسجيل الدخول عبر Google. تأكد من إعداد Google OAuth بشكل صحيح.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-cyan-400/25 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md lg:max-w-lg card-enhanced">
          <CardHeader className="text-center space-y-6 pb-8 px-8 pt-8">
            <div className="relative">
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
                  <Image
                  src="/images/Ziyara-logo.png"
                  alt="زيارة - منصة الرعاية الصحية"
                  width={160}
                  height={160}
                  className="object-contain w-full h-full relative z-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-emerald-500" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  زيارة
                </h1>
                <Stethoscope className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-emerald-600 font-semibold">
                منصة الرعاية الصحية الذكية
              </p>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-800">
              إنشاء حساب جديد
            </CardTitle>
            <CardDescription className="text-gray-600 text-base px-4">
              انشئ حسابًا لتتمكن من حجز المواعيد والاستفادة من خدماتنا
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* زر Google Sign-In */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mb-4 border-2 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>تسجيل الدخول بحساب Google</span>
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">أو</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="form-label">
                    الاسم الأول
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      placeholder="أحمد"
                      className="form-input pr-12"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="form-label">
                    اسم العائلة
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      placeholder="محمد"
                      className="form-input pr-12"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="form-label">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="form-input pr-12"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="form-label">
                  رقم الهاتف
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01234567890"
                    className="form-input pr-12"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="form-label">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="form-input pr-12"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="form-input pr-12"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm font-medium text-center bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}
              <Button type="submit" className="btn-primary" disabled={isLoading}>
                <span>{isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}</span>
                <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </form>

            {isLoading && (
              <LoadingOverlay message="جاري إنشاء الحساب وإرسال رمز التحقق..." />
            )}

            <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors duration-200"
              >
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
