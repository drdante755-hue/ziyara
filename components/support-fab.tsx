"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Headphones, X, MessageCircle, HelpCircle, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

export function SupportFAB() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-20 left-4 z-50 xl:bottom-6">
      {/* Menu Options */}
      <div
        className={cn(
          "absolute bottom-16 left-0 flex flex-col gap-2 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <Button
          onClick={() => {
            router.push("/user/checkout")
            setIsOpen(false)
          }}
          className="gap-2 shadow-lg bg-white text-gray-900 hover:bg-gray-100"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4" />
          سلة الطلبات
        </Button>
        <Button
          onClick={() => {
            router.push("/user/support")
            setIsOpen(false)
          }}
          className="gap-2 shadow-lg bg-white text-gray-900 hover:bg-gray-100"
          size="sm"
        >
          <MessageCircle className="w-4 h-4" />
          تذاكري
        </Button>
        <Button
          onClick={() => {
            router.push("/user/support?new=true")
            setIsOpen(false)
          }}
          className="gap-2 shadow-lg"
          size="sm"
        >
          <HelpCircle className="w-4 h-4" />
          طلب مساعدة
        </Button>
      </div>

      {/* FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "bg-gray-700 hover:bg-gray-600 rotate-180" : "bg-primary hover:bg-primary/90",
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Headphones className="w-6 h-6" />}
      </Button>
    </div>
  )
}
