import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { TestRequest } from "@/models/Service"

// GET - جلب طلب واحد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const testRequest = await TestRequest.findById(params.id).lean()

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: testRequest,
    })
  } catch (error) {
    console.error("Error fetching test request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الطلب" }, { status: 500 })
  }
}

// PUT - تحديث طلب تحليل
export async function PUT(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const body = await request.json()

    const testRequest = await TestRequest.findByIdAndUpdate(
      id,
      {
        patientName: body.patientName,
        phone: body.phone,
        whatsapp: body.whatsapp,
        address: body.address,
        tests: body.tests,
        totalPrice: body.totalPrice,
        date: body.date,
        time: body.time,
        notes: body.notes,
        team: body.team,
        status: body.status,
      },
      { new: true, runValidators: true },
    )

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: testRequest,
      message: "تم تحديث الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error updating test request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث الطلب" }, { status: 500 })
  }
}

// DELETE - حذف طلب
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop()
    await dbConnect()

    const testRequest = await TestRequest.findByIdAndDelete(id)

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error deleting test request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء ��ذف الطلب" }, { status: 500 })
  }
}
