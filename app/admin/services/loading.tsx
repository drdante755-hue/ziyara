import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
        <p className="mt-4 text-slate-600">جاري تحميل الخدمات...</p>
      </div>
    </div>
  )
}
