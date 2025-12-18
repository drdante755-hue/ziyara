"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, User } from "lucide-react"
import Image from "next/image"
import { WalletBalance } from "@/components/wallet-balance"
import { useCart } from "@/contexts/cart-context"

interface TopHeaderProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
  onProfileClick?: () => void
}

export function TopHeader({ activeSection, onSectionChange, onProfileClick }: TopHeaderProps) {
  const { setIsCartOpen, getCartCount } = useCart()
  const cartItemsCount = getCartCount()

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleSearchClick = () => {
    if (onSectionChange) {
      onSectionChange("search")
    }
  }

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    } else if (onSectionChange) {
      onSectionChange("profile")
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto h-14 xs:h-16 flex items-center justify-between px-3 xs:px-4 sm:px-6">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
            <Image src="/images/Ziyara-logo.png" alt="زيارة" width={32} height={32} className="object-contain xs:w-10 xs:h-10" />
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-primary">زيارة</h1>
          </div>
          <div className="relative hidden md:block w-48 lg:w-64 xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن الأدوية..."
              className="pl-10 pr-4 rounded-full bg-input border-border text-sm"
              onClick={handleSearchClick}
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
          {/* Removed ThemeToggle component */}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px] touch-manipulation"
            onClick={handleSearchClick}
          >
            <Search className="w-4 xs:w-5 h-4 xs:h-5" />
          </Button>

          <WalletBalance />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
            className="min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <User className="w-4 xs:w-5 h-4 xs:h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCartClick}
            className="relative min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <ShoppingCart className="w-4 xs:w-5 h-4 xs:h-5" />
            {cartItemsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 xs:h-5 w-4 xs:w-5 flex items-center justify-center text-[10px] xs:text-xs p-0"
              >
                {cartItemsCount > 9 ? "9+" : cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
