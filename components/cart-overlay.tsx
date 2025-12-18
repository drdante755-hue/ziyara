"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { motion, AnimatePresence } from "framer-motion"

export function CartOverlay() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()

  const subtotal = getCartTotal()
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              سلة التسوق
              {cartItems.length > 0 && (
                <span className="bg-white text-emerald-600 text-sm px-2 py-0.5 rounded-full">{cartItems.length}</span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">سلة التسوق فارغة</h3>
              <p className="text-gray-500 mb-6">ابدأ بإضافة منتجات لسلة التسوق</p>
              <Button onClick={() => setIsCartOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
                تصفح المنتجات
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 text-right">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 hover:bg-red-50 rounded-full transition-colors mr-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>

                        <p className="text-emerald-600 font-bold mt-1">{item.price} ج.م</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t bg-gray-50 p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-medium">{subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">التوصيل</span>
                <span className="text-emerald-600 font-medium">مجاني</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-emerald-600">{total.toFixed(2)} ج.م</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/user/checkout" className="block">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
                  onClick={() => setIsCartOpen(false)}
                >
                  إتمام الطلب
                </Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsCartOpen(false)}>
                متابعة التسوق
              </Button>
              <button onClick={clearCart} className="w-full text-sm text-red-500 hover:text-red-600 py-2">
                حذف جميع المنتجات
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
