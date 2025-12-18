import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Tracking, { getStatusInfo, HOME_TEST_STATUSES, PRODUCT_ORDER_STATUSES } from "@/models/Tracking"
import Order from "@/models/Order"
import { TestRequest } from "@/models/Service"

// GET - جلب بيانات التتبع للأدمن
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const tracking = await Tracking.findById(id).lean()

    if (!tracking) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على بيانات التتبع" }, { status: 404 })
    }

    // جلب البيانات المرتبطة
    let referenceData = null
    if (tracking.referenceType === "product_order") {
      referenceData = await Order.findById(tracking.referenceId).lean()
    } else if (tracking.referenceType === "home_test") {
      referenceData = await TestRequest.findById(tracking.referenceId).lean()
    }

    const statusHistory = tracking.statusHistory.map((item: any) => ({
      ...item,
      statusInfo: getStatusInfo(tracking.referenceType, item.status),
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        statusHistory,
        currentStatusInfo: getStatusInfo(tracking.referenceType, tracking.currentStatus),
        referenceData,
        availableStatuses:
          tracking.referenceType === "home_test"
            ? Object.values(HOME_TEST_STATUSES)
            : Object.values(PRODUCT_ORDER_STATUSES),
      },
    })
  } catch (error) {
    console.error("Error fetching tracking:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب بيانات التتبع" }, { status: 500 })
  }
}

// PATCH - تحديث حالة التتبع
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const { status, note, changedBy = "admin", changedByName, assignedTo, assignedToPhone, resultsFileUrl } = body

    const tracking = await Tracking.findById(id)

    if (!tracking) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على بيانات التتبع" }, { status: 404 })
    }

    // تحديث الحالة إذا تم توفيرها
    if (status) {
      tracking.currentStatus = status
      tracking.statusHistory.push({
        status,
        note: note || "",
        changedBy,
        changedByName,
        createdAt: new Date(),
      })

      // تحديث حالة الطلب المرتبط
      if (tracking.referenceType === "product_order") {
        const statusMapping: Record<string, string> = {
          order_created: "pending",
          payment_confirmed: "pending",
          preparing: "processing",
          shipped: "shipped",
          out_for_delivery: "shipped",
          delivered: "delivered",
          completed: "delivered",
          cancelled: "cancelled",
        }
        if (statusMapping[status]) {
          await Order.findByIdAndUpdate(tracking.referenceId, { status: statusMapping[status] })
        }
      } else if (tracking.referenceType === "home_test") {
        const statusMapping: Record<string, string> = {
          order_created: "جاري",
          payment_confirmed: "جاري",
          technician_assigned: "جاري",
          technician_on_way: "جاري",
          sample_collected: "جاري",
          sample_in_analysis: "جاري",
          results_ready: "جاري",
          completed: "مكتمل",
          cancelled: "ملغى",
        }
        if (statusMapping[status]) {
          await TestRequest.findByIdAndUpdate(tracking.referenceId, { status: statusMapping[status] })
        }
      }

      // تحديث تاريخ التوصيل الفعلي
      if (status === "delivered" || status === "completed") {
        tracking.actualDelivery = new Date()
      }
    }

    // تحديث المعلومات الإضافية
    if (assignedTo !== undefined) tracking.assignedTo = assignedTo
    if (assignedToPhone !== undefined) tracking.assignedToPhone = assignedToPhone
    if (resultsFileUrl !== undefined) tracking.resultsFileUrl = resultsFileUrl
    if (note && !status) tracking.notes = note

    await tracking.save()

    return NextResponse.json({
      success: true,
      data: tracking,
      message: "تم تحديث التتبع بنجاح",
    })
  } catch (error) {
    console.error("Error updating tracking:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث التتبع" }, { status: 500 })
  }
}
