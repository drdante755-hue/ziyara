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

import { ArrowRight, User, Lock, Heart, Stethoscope } from "lucide-react";
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل إنشاء الحساب");
        setIsLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        redirect: false,
        emailOrPhone: formData.email,
        password: formData.password,
      });

      if (login?.ok) {
        router.push("/verify-email");
      } else {
        setError("تم إنشاء الحساب لكن فشل تسجيل الدخول");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <Image
              src="/images/Ziyara-logo.png"
              alt="زيارة"
              width={120}
              height={120}
              className="mx-auto"
            />

            <div className="flex items-center justify-center gap-2">
              <Heart className="text-emerald-500" />
              <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
              <Stethoscope className="text-emerald-500" />
            </div>

            <CardDescription>
              سجل الآن للاستفادة من خدمات منصة زيارة
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input id="firstName" placeholder="الاسم الأول" onChange={handleInputChange} />
                <Input id="lastName" placeholder="اسم العائلة" onChange={handleInputChange} />
              </div>

              <Input id="email" type="email" placeholder="البريد الإلكتروني" onChange={handleInputChange} />
              <Input id="phone" type="tel" placeholder="رقم الهاتف" onChange={handleInputChange} />
              <Input id="password" type="password" placeholder="كلمة المرور" onChange={handleInputChange} />
              <Input id="confirmPassword" type="password" placeholder="تأكيد كلمة المرور" onChange={handleInputChange} />

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            {isLoading && <LoadingOverlay message="جاري إنشاء الحساب..." />}

            <p className="text-center text-sm mt-6">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-semibold">
                تسجيل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
