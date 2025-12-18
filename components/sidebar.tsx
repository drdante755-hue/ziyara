"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Home, User, Settings, Info, Phone, CreditCard, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // إنهاء جلسة NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: "/login"
      })
      // التوجيه إلى صفحة تسجيل الدخول
      router.push("/login")
    } catch (error) {
      console.error("خطأ أثناء تسجيل الخروج:", error)
      // في حالة الخطأ، التوجيه مباشرة
      router.push("/login")
    }
  }

  const navigationItems = [
    { id: "home", label: "الرئيسية", icon: Home, href: "/home" },
    { id: "medicines", label: "الأدوية", icon: "logo", href: "/home?section=medicines" }, // استبدال أيقونة السماعة بلوجو زيارة
    { id: "nurse-request", label: "طلب ممرض", icon: User, href: "/home?section=nurse-request" },
    { id: "profile", label: "حسابي", icon: User, href: "/profile" },
  ]

  const supportItems = [
    { id: "settings", label: "الإعدادات", icon: Settings, href: "/settings" },
    { id: "about", label: "عن زيارة", icon: Info, href: "/about" },
    { id: "contact", label: "تواصل معنا", icon: Phone, href: "/contact" },
    { id: "pricing", label: "الأسعار", icon: CreditCard, href: "/pricing" },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r shadow-sm">
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-emerald-700">زيارة</h2>
        <p className="text-sm text-gray-500">صيدليتك الرقمية</p>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.id} href={item.href} passHref>
            <Button
              variant="ghost"
              className="w-full justify-start text-lg font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {item.icon === "logo" ? (
                <div className="w-5 h-5 ml-3 relative">
                  <Image src="/images/Ziyara-logo.png" alt="زيارة" fill className="object-contain" />
                </div>
              ) : (
                <item.icon className="w-5 h-5 ml-3" />
              )}
              {item.label}
            </Button>
          </Link>
        ))}
        <Separator className="my-4" />
        {supportItems.map((item) => (
          <Link key={item.id} href={item.href} passHref>
            <Button
              variant="ghost"
              className="w-full justify-start text-base text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            >
              <item.icon className="w-5 h-5 ml-3" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 ml-3" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
