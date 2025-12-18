"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Bell, X, Package, Percent, Info } from "lucide-react"

interface NotificationsOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsOverlay({ isOpen, onClose }: NotificationsOverlayProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "طلبك #123456 في الطريق!",
      description: "سيصل طلبك خلال 30 دقيقة.",
      time: "منذ 5 دقائق",
      icon: Package,
      color: "text-emerald-600",
    },
    {
      id: 2,
      type: "discount",
      title: "خصم 20% على جميع الفيتامينات!",
      description: "استخدم كود خصم VITAMIN20 عند الدفع.",
      time: "منذ ساعة",
      icon: Percent,
      color: "text-purple-600",
    },
    {
      id: 3,
      type: "info",
      title: "تحديثات جديدة في سياسة الخصوصية",
      description: "يرجى مراجعة سياسة الخصوصية الجديدة لدينا.",
      time: "منذ يوم",
      icon: Info,
      color: "text-blue-600",
    },
    {
      id: 4,
      type: "order",
      title: "تم توصيل طلبك #123455",
      description: "نأمل أن تكون راضياً عن خدمتنا.",
      time: "منذ يومين",
      icon: Package,
      color: "text-emerald-600",
    },
  ])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pr-6">
          <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            الإشعارات
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">لا توجد إشعارات جديدة.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${notification.color.replace("text-", "bg-")}/10`}
                >
                  <notification.icon className={`w-5 h-5 ${notification.color}`} />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full bg-transparent">
              عرض كل الإشعارات
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
