"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { CheckCircle, ShoppingCart, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CartAddedModal() {
  const { lastAddedItem, showAddedModal, setShowAddedModal, setIsCartOpen, getCartCount, getCartTotal } = useCart()

  if (!lastAddedItem) return null

  return (
    <AnimatePresence>
      {showAddedModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowAddedModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">تمت الإضافة بنجاح!</h3>
                      <p className="text-emerald-100 text-sm">تم إضافة المنتج إلى سلة التسوق</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddedModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex gap-4 items-center bg-gray-50 rounded-xl p-3">
                  <img
                    src={lastAddedItem.image || "/placeholder.svg"}
                    alt={lastAddedItem.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 text-right">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">{lastAddedItem.name}</h4>
                    <p className="text-emerald-600 font-bold text-lg">{lastAddedItem.price} ج.م</p>
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">عدد المنتجات في السلة:</span>
                    <span className="font-bold text-emerald-700">{getCartCount()} منتج</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">إجمالي السلة:</span>
                    <span className="font-bold text-emerald-700">{getCartTotal().toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddedModal(false)}>
                  متابعة التسوق
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setShowAddedModal(false)
                    setIsCartOpen(true)
                  }}
                >
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  عرض السلة
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
