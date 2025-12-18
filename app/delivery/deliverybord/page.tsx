"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

type Order = {
  _id: string
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone?: string
  address?: string
  items?: { name: string; qty: number }[]
  updatedAt?: string
}

export default function DeliveryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    if (!session) {
      router.push("/delivery/login")
    }
  }, [session, router])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/delivery/orders")
      if (!res.ok) {
        let body = null
        try {
          body = await res.json()
        } catch (e) {
          body = await res.text()
        }
        console.error("/api/delivery/orders returned error", res.status, body)
        setErrorMsg(`فشل جلب الطلبات: ${res.status} ${JSON.stringify(body)}`)
        setLoading(false)
        return
      }
      const data = await res.json()
      const normalized = (data.orders || []).map((o: any) => ({ ...o, id: o.id || o._id }))
      setOrders(normalized)
    } catch (err) {
      console.error("fetchOrders error:", err)
      setErrorMsg(String(err))
    }
    setLoading(false)
  }

  const markDelivered = async (orderId: string) => {
    if (!confirm("تأكيد: تم توصيل الطلب؟")) return
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      })
      if (!res.ok) throw new Error("Failed")
      // update UI
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o)))
      if (selected?.id === orderId) setSelected({ ...selected, status: "delivered" })
      alert("تم تحديث حالة الطلب إلى تم التسليم")
    } catch (err) {
      console.error(err)
      alert("فشل تحديث الحالة")
    }
  }

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card/50 flex-shrink-0">
        <h1 className="text-lg font-semibold">لوحة الدليفري</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{session?.user?.name || "مندوب التوصيل"}</div>
            <div className="text-xs text-muted-foreground">{session?.user?.email || ""}</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/delivery/login" })}>
            تسجيل خروج
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
      <div className="w-80 border-l border-border bg-card p-3">
        <h2 className="font-semibold mb-3">طلبات التوصيل</h2>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="space-y-2">
            {errorMsg && (
              <div className="p-2 bg-destructive/10 text-destructive text-sm rounded mb-2">{errorMsg}</div>
            )}
            {loading ? (
              <div>جاري التحميل...</div>
            ) : orders.length === 0 ? (
              <div>لا توجد طلبات</div>
            ) : (
              orders.map((o) => (
                <button
                  key={o.id || o._id}
                  onClick={() => setSelected(o)}
                  className={`w-full text-right p-2 rounded-md hover:bg-muted/50 ${selected?.id === o.id ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">{o.customerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold truncate">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.status}</div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">#{o.orderNumber} · {o.address}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">طلب #{selected.orderNumber}</h3>
              <div className="text-sm text-muted-foreground">{selected.status}</div>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">العميل</div>
                  <div className="font-medium">{selected.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">آخر تحديث</div>
                  <div className="font-medium">{selected.updatedAt ? format(new Date(selected.updatedAt), "hh:mm a, dd/MM/yyyy") : "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">العنوان</div>
                <div className="font-medium">{selected.address || "-"}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">المحتويات</div>
                <ul className="list-disc list-inside mt-2">
                  {selected.items?.map((it, idx) => (
                    <li key={idx} className="text-sm">{it.name} × {it.qty}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              {selected.status !== "delivered" && (
                <Button onClick={() => markDelivered(selected.id)} className="bg-primary text-primary-foreground">
                  تم التسليم
                </Button>
              )}
              <Button variant="outline" onClick={() => { setSelected(null) }}>إغلاق</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">اختر طلب من القائمة لعرض التفاصيل</div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
