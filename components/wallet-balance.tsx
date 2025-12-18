"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Wallet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletBalanceResponse {
  success: boolean
  balance: number
}

export function WalletBalance() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) return

    try {
      setError(null)
      const response = await fetch("/api/wallet/balance")
      const data: WalletBalanceResponse = await response.json()

      if (data.success) {
        setBalance(data.balance)
      } else {
        setError("Failed to fetch balance")
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err)
      setError("Error loading balance")
    } finally {
      setIsLoading(false)
      setHasFetched(true)
    }
  }, [session, status])

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || !session?.user) {
      setIsLoading(false)
      return
    }

    // جلب الرصيد مرة واحدة فقط
    if (!hasFetched) {
      fetchBalance()
    }

    const interval = setInterval(fetchBalance, 120000)
    return () => clearInterval(interval)
  }, [session, status, hasFetched, fetchBalance])

  const handleClick = () => {
    router.push("/user/wallet")
  }

  if (status === "unauthenticated" || !session?.user) {
    return null
  }

  if (isLoading && !hasFetched) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    )
  }

  if (error || balance === null) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="hidden md:flex items-center gap-2 hover:bg-emerald-50"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-xs">محفظتي</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <Wallet className="w-4 h-4 text-emerald-700" />
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold text-emerald-700">EG</span>
        <span className="text-sm font-bold">{balance.toFixed(2)}</span>
      </div>
    </Button>
  )
}
