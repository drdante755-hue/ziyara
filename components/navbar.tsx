"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Home, Star, CreditCard, Phone, User, Bell, Search, ShoppingBag } from "lucide-react"

const navigationItems = [
  { id: "home", label: "الرئيسية", href: "/home", icon: Home },
  { id: "features", label: "المميزات", href: "/features", icon: Star },
  { id: "pricing", label: "الأسعار", href: "/pricing", icon: CreditCard },
  { id: "contact", label: "تواصل معنا", href: "/contact", icon: Phone },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <Image src="/images/Ziyara-logo.png" alt="زيارة" width={56} height={40} className="object-contain" />
            <span className="text-xl font-bold text-primary">زيارة</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <ShoppingBag className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">أحمد محمد</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Image src="/images/Ziyara-logo.png" alt="زيارة" width={40} height={40} className="object-contain" />
                    <span className="text-lg font-bold text-primary">زيارة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 py-4">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground rounded-lg transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        البحث
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 relative text-muted-foreground">
                        <Bell className="h-4 w-4" />
                        الإشعارات
                        <Badge className="mr-auto h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground p-0 flex items-center justify-center">
                          3
                        </Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                        <ShoppingBag className="h-4 w-4" />
                        سلة التسوق
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile User Info */}
                <div className="border-t border-border pt-4">
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-3 p-3 rounded-lg transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">أحمد محمد</p>
                        <p className="text-xs text-muted-foreground">عضو مميز</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
