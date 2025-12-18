import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { firstName, lastName, email, phone, password } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Prevent duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || "",
      password: hashed,
      role: "delivery",
      profileCompleted: true,
      emailVerified: true,
    })

    return NextResponse.json({ success: true, user: { id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}` } })
  } catch (err) {
    console.error("/api/admin/delivery POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
