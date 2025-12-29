"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Menu,
  X,
  LogOut,
  BarChart3,
  Package,
  ListIcon,
  ShoppingCart,
  Home,
  TicketIcon,
  Activity,
  Stethoscope,
  HeartHandshake,
  Microscope,
  Wallet,
  ImageIcon,
  Building2,
  Hospital,
  UserRound,
  CalendarCheck,
} from "lucide-react"

const adminMenuItems = [
  { name: "لوحة التحكم", icon: BarChart3, href: "/admin/dashboard" },
  { name: "المنتجات", icon: Package, href: "/admin/products" },
  { name: "الأقسام", icon: ListIcon, href: "/admin/categories" },
  { name: "الطلبات", icon: ShoppingCart, href: "/admin/orders" },
  { name: "البنرات", icon: ImageIcon, href: "/admin/banners" },
  { name: "الخدمات المنزلية", icon: Home, href: "/admin/services" },
  { name: "الخصومات", icon: TicketIcon, href: "/admin/discounts" },
  { name: "الممرضات", icon: Stethoscope, href: "/admin/nurses" },
  { name: "الاختبارات", icon: Microscope, href: "/admin/tests" },
  { name: "العيادات", icon: Building2, href: "/admin/clinics" },
  { name: "الأطباء", icon: UserRound, href: "/admin/providers" },
  { name: "الحجوزات", icon: CalendarCheck, href: "/admin/bookings" },
  { name: "طلبات المحفظة", icon: Wallet, href: "/admin/wallet/recharge-requests" },
  { name: "الدعم والمساعدة", icon: HeartHandshake, href: "/admin/support" },
  { name: "سجل النشاط", icon: Activity, href: "/admin/activity-logs" },
  { name: "تذاكر الدعم", icon: TicketIcon, href: "/admin/tickets" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false, callbackUrl: "/login" })
      router.push("/login")
    } catch (error) {
      console.error("خطأ أثناء تسجيل الخروج:", error)
      router.push("/login")
    }
  }

  const getPageTitle = () => {
    const menuItem = adminMenuItems.find((item) => item.href === pathname)
    return menuItem?.name || "لوحة التحكم"
  }

  return (
    <div className="flex h-screen bg-background rtl flex-col lg:flex-row">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-screen w-64 bg-card border-l border-border shadow-lg z-40 transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">
                {session?.user?.name ? session.user.name.trim().split(" ")[0][0].toUpperCase() : ""}
              </span>
            </div>
            <h2 className="text-base lg:text-lg font-bold text-primary truncate">زيارة</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg transition flex-shrink-0">
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href.split("/").slice(0, 3).join("/"))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 group text-sm lg:text-base ${
                  isActive ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`}
                />
                <span className="font-medium hidden xs:inline">{item.name}</span>
                {isActive && <div className="mr-auto w-1 h-1 bg-primary-foreground rounded-full hidden lg:block"></div>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-2 lg:p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 text-destructive rounded-lg transition-all duration-200 font-medium text-sm lg:text-base"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden xs:inline">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
          <div className="h-14 lg:h-16 px-3 lg:px-6 flex items-center justify-between gap-2 lg:gap-4">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg transition flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">لوحة التحكم</p>
                <h1 className="text-base lg:text-xl font-bold text-foreground truncate">{getPageTitle()}</h1>
              </div>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <div className="hidden sm:block text-right border-r border-border pr-2 lg:pr-4">
                <p className="text-xs lg:text-sm font-semibold text-foreground">{session?.user?.name || "المسؤول"}</p>
                <p className="text-xs text-muted-foreground hidden md:block">{session?.user?.email || ""}</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">
                  {session?.user?.name ? session.user.name.trim().split(" ")[0][0].toUpperCase() : ""}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-background">
          <div className="min-h-full p-3 sm:p-4 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
