import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Banner from "@/models/Banner"
import Product from "@/models/Product"

// GET - Fetch a single banner
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const banner = await Banner.findById(id).lean()

    if (!banner) {
      return NextResponse.json({ success: false, error: "البانر غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: banner,
    })
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب البانر" }, { status: 500 })
  }
}

// PUT - Update a banner
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    // Update banner data
    const bannerData: any = {
      title: body.title,
      description: body.description,
      actionType: body.actionType,
      isActive: body.isActive,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    // Update image if provided
    if (body.imageUrl) {
      bannerData.imageUrl = body.imageUrl
      bannerData.imagePublicId = body.imagePublicId
      bannerData.imageMimeType = body.imageMimeType
      bannerData.imageWidth = body.imageWidth
      bannerData.imageHeight = body.imageHeight
    }

    // Action specific fields
    if (body.actionType === "discount") {
      bannerData.discountType = body.discountType
      bannerData.discountValue = body.discountValue
      // Clear other action fields
      bannerData.targetCategoryId = undefined
      bannerData.targetProductId = undefined
      bannerData.targetUrl = undefined
    } else if (body.actionType === "category") {
      bannerData.targetCategoryId = body.targetCategoryId
      bannerData.discountType = undefined
      bannerData.discountValue = undefined
      bannerData.targetProductId = undefined
      bannerData.targetUrl = undefined
    } else if (body.actionType === "product") {
      bannerData.targetProductId = body.targetProductId
      bannerData.discountType = undefined
      bannerData.discountValue = undefined
      bannerData.targetCategoryId = undefined
      bannerData.targetUrl = undefined
    } else if (body.actionType === "url") {
      bannerData.targetUrl = body.targetUrl
      bannerData.discountType = undefined
      bannerData.discountValue = undefined
      bannerData.targetCategoryId = undefined
      bannerData.targetProductId = undefined
    }

    const banner = await Banner.findByIdAndUpdate(id, bannerData, { new: true, runValidators: true })

    if (!banner) {
      return NextResponse.json({ success: false, error: "البانر غير موجود" }, { status: 404 })
    }

    if (body.actionType === "discount" && body.linkedProductIds) {
      // Remove banner link from all products that were previously linked
      await Product.updateMany({ discountBannerId: id }, { $unset: { discountBannerId: 1 } })

      // Add banner link to the new set of products
      if (body.linkedProductIds.length > 0) {
        await Product.updateMany({ _id: { $in: body.linkedProductIds } }, { $set: { discountBannerId: id } })
      }
    }

    return NextResponse.json({
      success: true,
      data: banner,
      message: "تم تحديث البانر بنجاح",
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث البانر" }, { status: 500 })
  }
}

// DELETE - Delete a banner
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    await Product.updateMany({ discountBannerId: id }, { $unset: { discountBannerId: 1 } })

    const banner = await Banner.findByIdAndDelete(id)

    if (!banner) {
      return NextResponse.json({ success: false, error: "البانر غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف البانر بنجاح",
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف البانر" }, { status: 500 })
  }
}
