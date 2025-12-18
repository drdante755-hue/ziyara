import { NextResponse, type NextRequest } from "next/server"
import dbConnect from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import emitTicketStatusChange from "@/lib/socketClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import mongoose from "mongoose"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Only ticket owner (user) or admin
    const role = (session.user as any).role
    const userId =
      (session.user as any).id ||
      (session.user as any).sub ||
      (session.user as any).userId

    if (role !== "admin" && String(ticket.userId) !== String(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (ticket.status !== "auto_created") {
      return NextResponse.json({ error: "Ticket already opened" }, { status: 400 })
    }

    ticket.status = "open"
    ticket.openedAt = new Date()
    await ticket.save()

    // Notify socket server
    try {
      emitTicketStatusChange({
        ticketId: ticket._id.toString(),
        status: "open",
        changedBy: String(userId || "system"),
        changedByName: (session.user as any)?.name,
      })
    } catch (e) {
      console.warn("emit ticket open failed:", e)
    }

    return NextResponse.json({ ticket })
  } catch (err) {
    console.error("/api/tickets/[id]/open POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
