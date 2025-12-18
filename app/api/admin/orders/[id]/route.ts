import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import Tracking from "@/models/Tracking"
import ActivityLog from "@/models/ActivityLog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

type RouteParams = { params: Promise<{ id: string }> }

// GET - Get single order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect()
    const { id } = await params

    const order = await Order.findById(id).populate({
      path: "trackingId",
      select: "trackingNumber currentStatus statusHistory referenceType",
    })

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الطلب" }, { status: 500 })
  }
}

// PUT - Update order
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { id } = await params
    const body = await request.json()

    if (body.paymentStatus !== undefined) {
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json(
          {
            error: "غير مصرح لك بتعديل حالة الدفع. هذه الصلاحية للمدير فقط.",
            code: "PAYMENT_STATUS_ADMIN_ONLY",
          },
          { status: 403 },
        )
      }
    }

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    const oldStatus = order.status
    const oldPaymentStatus = order.paymentStatus

    if (body.status && body.status !== oldStatus) {
      // Update Order.status
      order.status = body.status

      // Update Tracking.currentStatus to keep them in sync
      if (order.trackingId) {
        const tracking = await Tracking.findById(order.trackingId)
        if (tracking) {
          // Add to status history
          tracking.statusHistory.push({
            status: body.status,
            changedBy: "admin",
            changedByName: session?.user?.name || "المسؤول",
            createdAt: new Date(),
          })
          // Update currentStatus - THIS IS THE KEY FIX
          tracking.currentStatus = body.status
          await tracking.save()
        }
      } else {
        const newTracking = await Tracking.create({
          referenceId: order._id,
          referenceType: "product_order",
          trackingNumber: `TRK-${order.orderNumber}`,
          currentStatus: body.status,
          statusHistory: [
            {
              status: body.status,
              changedBy: "admin",
              changedByName: session?.user?.name || "المسؤول",
              createdAt: new Date(),
            },
          ],
        })
        order.trackingId = newTracking._id
      }
    }

    if (body.paymentStatus === "paid" && oldPaymentStatus !== "paid") {
      order.paymentConfirmedAt = new Date()
      order.paymentConfirmedBy = session?.user?.name || "المسؤول"

      // If order is still in initial state, move to payment_confirmed
      if (["pending", "order_created", "processing"].includes(order.status)) {
        order.status = "payment_confirmed"

        // Update tracking as well
        if (order.trackingId) {
          const tracking = await Tracking.findById(order.trackingId)
          if (tracking) {
            tracking.statusHistory.push({
              status: "payment_confirmed",
              changedBy: "admin",
              changedByName: session?.user?.name || "المسؤول",
              createdAt: new Date(),
            })
            tracking.currentStatus = "payment_confirmed"
            await tracking.save()
          }
        }
      }
    }

    // Update other fields from body
    const fieldsToUpdate = ["notes", "estimatedDeliveryDate", "shippingAddress", "customerPhone"]
    fieldsToUpdate.forEach((field) => {
      if (body[field] !== undefined) {
        ;(order as any)[field] = body[field]
      }
    })

    if (body.paymentStatus) {
      order.paymentStatus = body.paymentStatus
    }

    await order.save()

    // Log status changes
    if (body.status && body.status !== oldStatus) {
      await ActivityLog.create({
        admin: session?.user?.name || "المسؤول",
        action: "تحديث حالة الطلب",
        type: "تعديل",
        details: `تم تغيير حالة الطلب #${order.orderNumber} من "${oldStatus}" إلى "${body.status}"`,
        target: "طلب",
        targetId: order._id.toString(),
      })
    }

    if (body.paymentStatus && body.paymentStatus !== oldPaymentStatus) {
      await ActivityLog.create({
        admin: session?.user?.name || "المسؤول",
        action: "تحديث حالة الدفع",
        type: "تعديل",
        details: `تم تغيير حالة الدفع للطلب #${order.orderNumber} من "${oldPaymentStatus}" إلى "${body.paymentStatus}" بواسطة ${session?.user?.name || "المسؤول"}`,
        target: "طلب",
        targetId: order._id.toString(),
      })
    }

    const updatedOrder = await Order.findById(id).populate({
      path: "trackingId",
      select: "trackingNumber currentStatus statusHistory referenceType",
    })

    return NextResponse.json({
      order: updatedOrder,
      message: "تم تحديث الطلب بنجاح",
      paymentConfirmedBy: order.paymentConfirmedBy,
      paymentConfirmedAt: order.paymentConfirmedAt,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "حدث خطأ في تحديث الطلب" }, { status: 500 })
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { id } = await params

    const order = await Order.findByIdAndDelete(id)
    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    if (order.trackingId) {
      await Tracking.findByIdAndDelete(order.trackingId)
    }

    await ActivityLog.create({
      admin: session?.user?.name || "المسؤول",
      action: "حذف طلب",
      type: "حذف",
      details: `تم حذف الطلب #${order.orderNumber}`,
      target: "طلب",
      targetId: id,
    })

    return NextResponse.json({ message: "تم حذف الطلب بنجاح" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "حدث خطأ في حذف الطلب" }, { status: 500 })
  }
}
