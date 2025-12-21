import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Provider from "@/models/Provider"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()
    const rating = Number(body?.rating || 0)

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "تقييم غير صالح" }, { status: 400 })
    }

    const provider = await Provider.findById(id)
    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    const currentRating = Number(provider.rating || 0)
    const currentCount = Number(provider.reviewsCount || 0)
    const newCount = currentCount + 1
    const newRating = (currentRating * currentCount + rating) / newCount

    provider.rating = Number(newRating.toFixed(2))
    provider.reviewsCount = newCount
    await provider.save()

    return NextResponse.json({ success: true, provider: { id: provider._id.toString(), rating: provider.rating, reviewsCount: provider.reviewsCount } })
  } catch (error) {
    console.error("Error rating provider:", error)
    return NextResponse.json({ success: false, error: "فشل في إرسال التقييم" }, { status: 500 })
  }
}
