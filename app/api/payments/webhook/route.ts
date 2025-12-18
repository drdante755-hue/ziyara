import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import PaymentTransaction from "@/models/PaymentTransaction"
import AvailabilitySlot from "@/models/AvailabilitySlot"

// POST - Payment webhook handler
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { transactionId, status, providerTransactionId, metadata } = body

    // Find the payment transaction
    const transaction = await PaymentTransaction.findOne({ transactionId })
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction status
    transaction.status = status
    transaction.providerTransactionId = providerTransactionId

    if (metadata) {
      transaction.metadata = { ...transaction.metadata, ...metadata }
    }

    if (status === "completed") {
      transaction.completedAt = new Date()

      // Update booking status
      if (transaction.bookingId) {
        const booking = await Booking.findById(transaction.bookingId)
        if (booking) {
          booking.paymentStatus = "paid"
          booking.status = "confirmed"
          await booking.save()
        }
      }
    } else if (status === "failed") {
      transaction.failedAt = new Date()

      // Revert booking and slot if payment failed
      if (transaction.bookingId) {
        const booking = await Booking.findById(transaction.bookingId)
        if (booking) {
          booking.paymentStatus = "failed"
          booking.status = "cancelled"
          await booking.save()

          // Revert slot to available
          if (booking.slotId) {
            await AvailabilitySlot.findByIdAndUpdate(booking.slotId, {
              status: "available",
              bookingId: null,
            })
          }
        }
      }
    } else if (status === "refunded") {
      transaction.refundedAt = new Date()

      if (transaction.bookingId) {
        const booking = await Booking.findById(transaction.bookingId)
        if (booking) {
          booking.paymentStatus = "refunded"
          await booking.save()
        }
      }
    }

    await transaction.save()

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 })
  }
}
