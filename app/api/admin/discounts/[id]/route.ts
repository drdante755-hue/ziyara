import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Discount from "@/models/Discount";
import ActivityLog from "@/models/ActivityLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// GET - Fetch single discount
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const discount = await Discount.findById(id);

    if (!discount) {
      return NextResponse.json({ error: "الخصم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ discount });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الخصم" },
      { status: 500 }
    );
  }
}

// PUT - Update discount
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const discount = await Discount.findById(id);

    if (!discount) {
      return NextResponse.json({ error: "الخصم غير موجود" }, { status: 404 });
    }

    // Check if new code already exists (if code is being changed)
    if (body.code && body.code.toUpperCase() !== discount.code) {
      const existingDiscount = await Discount.findOne({
        code: body.code.toUpperCase(),
      });
      if (existingDiscount) {
        return NextResponse.json(
          { error: "كود الخصم موجود بالفعل" },
          { status: 400 }
        );
      }
    }

    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      {
        ...body,
        code: body.code?.toUpperCase() || discount.code,
        expiryDate: body.expiryDate
          ? new Date(body.expiryDate)
          : discount.expiryDate,
      },
      { new: true }
    );

    // Log activity
    await ActivityLog.create({
      admin: session?.user.name || "المسؤول",
      action: "تعديل كود خصم",
      type: "تعديل",
      details: `عدّل كود الخصم "${updatedDiscount.code}"`,
      target: "خصم",
      targetId: id,
    });

    return NextResponse.json({ discount: updatedDiscount });
  } catch (error) {
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الخصم" },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const { id } = await params;

    const discount = await Discount.findById(id);

    if (!discount) {
      return NextResponse.json({ error: "الخصم غير موجود" }, { status: 404 });
    }

    await Discount.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      admin: session?.user.name || "المسؤول",
      action: "حذف كود خصم",
      type: "حذف",
      details: `حذف كود الخصم "${discount.code}"`,
      target: "خصم",
      targetId: id,
    });

    return NextResponse.json({ message: "تم حذف الخصم بنجاح" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف الخصم" },
      { status: 500 }
    );
  }
}
