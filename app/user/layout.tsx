"use client"

import type React from "react"

import { CartProvider } from "@/contexts/cart-context"
import { CartOverlay } from "@/components/cart-overlay"
import { CartAddedModal } from "@/components/cart-added-modal"
import { SupportFAB } from "@/components/support-fab"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartOverlay />
      <CartAddedModal />
      <SupportFAB />
    </CartProvider>
  )
}
