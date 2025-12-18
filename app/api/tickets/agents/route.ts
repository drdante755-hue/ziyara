import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import type { ApiResponse } from "@/types/ticket"

// GET /api/tickets/agents - Get all agents (admins)
export async function GET() {
  try {
    await connectDB()

    const agents = await User.find({
      role: "admin",
    })
      .select("_id firstName lastName email role createdAt")
      .sort({ firstName: 1 })
      .lean()

    const formattedAgents = agents.map((agent: any) => ({
      id: agent._id.toString(),
      name: `${agent.firstName || ""} ${agent.lastName || ""}`.trim() || "بدون اسم",
      email: agent.email,
      avatar: "/placeholder.svg",
      role: agent.role,
      createdAt: agent.createdAt,
    }))

    const response: ApiResponse<any[]> = {
      success: true,
      data: formattedAgents,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ success: false, error: "فشل جلب قائمة الوكلاء" }, { status: 500 })
  }
}
