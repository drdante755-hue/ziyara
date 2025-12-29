import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Provider from "@/models/Provider"
import Booking from "@/models/Booking"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(request.url)
    const id = url.pathname.split("/").filter(Boolean).pop()
    const dateParam = url.searchParams.get("date")

    if (!id) {
      return NextResponse.json({ success: false, error: "معرّف الطبيب مطلوب" }, { status: 400 })
    }

    const provider = await Provider.findById(id)
    if (!provider) return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })

    if (provider.receptionType === "open") {
      return NextResponse.json({ success: true, open: true })
    }

    const capacity = typeof provider.receptionCapacity === "number" ? provider.receptionCapacity : 0

    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const activeCount = await Booking.countDocuments({
      providerId: provider._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ["cancelled", "no-show"] },
    })

    const remaining = Math.max(0, capacity - activeCount)

    return NextResponse.json({ success: true, open: false, capacity, used: activeCount, remaining })
  } catch (error) {
    console.error("Error fetching provider capacity:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب سعة الطبيب" }, { status: 500 })
  }
}
