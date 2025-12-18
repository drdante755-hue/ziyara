"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Search, ShoppingCart, User, HeartPulse } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface BottomNavbarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function BottomNavbar({ activeSection, onSectionChange }: BottomNavbarProps) {
  const { setIsCartOpen, getCartCount } = useCart()
  const cartItemsCount = getCartCount()

  const navItems = [
    {
      id: "home",
      label: "الرئيسية",
      icon: Home,
    },
    {
      id: "search",
      label: "البحث",
      icon: Search,
    },
    {
      id: "nurse",
      label: "ممرض",
      icon: HeartPulse,
    },
    {
      id: "cart",
      label: "السلة",
      icon: ShoppingCart,
      badge: cartItemsCount,
    },
    {
      id: "profile",
      label: "الملف",
      icon: User,
    },
  ]

  const handleNavClick = (id: string) => {
    if (id === "cart") {
      setIsCartOpen(true)
    } else {
      onSectionChange(id)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-40 xl:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 relative ${
              activeSection === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {item.badge > 9 ? "9+" : item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </nav>
  )
}
