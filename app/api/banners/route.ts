import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Banner from "@/models/Banner"

// GET - Fetch active banners for a specific position
// This is the public endpoint used by /user/home
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position") || "user-home-main"

    const now = new Date()

    const banners = await Banner.find({
      position,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error("Error fetching active banners:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 })
  }
}
