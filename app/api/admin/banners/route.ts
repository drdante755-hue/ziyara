import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Banner from "@/models/Banner"
import Product from "@/models/Product"
import { uploadToCloudinary } from "@/lib/cloudinary"

// GET - Fetch all banners
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position") || "user-home-main"
    const includeInactive = searchParams.get("includeInactive") === "true"

    const filter: any = { position }

    if (!includeInactive) {
      filter.isActive = true
      const now = new Date()
      filter.startDate = { $lte: now }
      filter.endDate = { $gte: now }
    }

    const banners = await Banner.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 })
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    // Required validation
    if (!body.title || !body.actionType || !body.startDate || !body.endDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate action type specific fields
    if (body.actionType === "discount" && (body.discountValue === undefined || !body.discountType)) {
      return NextResponse.json(
        { success: false, error: "Discount banners require discountType and discountValue" },
        { status: 400 },
      )
    }

    if (body.actionType === "category" && !body.targetCategoryId) {
      return NextResponse.json({ success: false, error: "Category banners require targetCategoryId" }, { status: 400 })
    }

    if (body.actionType === "product" && !body.targetProductId) {
      return NextResponse.json({ success: false, error: "Product banners require targetProductId" }, { status: 400 })
    }

    if (body.actionType === "url" && !body.targetUrl) {
      return NextResponse.json({ success: false, error: "URL banners require targetUrl" }, { status: 400 })
    }

    let imageUrl = body.imageUrl
    let imagePublicId = body.imagePublicId
    let imageWidth = body.imageWidth
    let imageHeight = body.imageHeight
    const imageMimeType = body.imageMimeType

    // If client sent base64 imageData (legacy), upload to Cloudinary server-side
    if ((!imageUrl || !imagePublicId) && body.imageData) {
      const uploadResult = await uploadToCloudinary(body.imageData, "banners")
      imageUrl = uploadResult.imageUrl
      imagePublicId = uploadResult.imagePublicId
      imageWidth = uploadResult.width
      imageHeight = uploadResult.height
    }

    // Require image fields
    if (!imageUrl || !imagePublicId) {
      return NextResponse.json(
        { success: false, error: "imageUrl and imagePublicId are required (or provide imageData)" },
        { status: 400 },
      )
    }

    // Banner data
    const bannerData: any = {
      imageUrl,
      imagePublicId,
      imageMimeType,
      imageWidth: imageWidth || 1920,
      imageHeight: imageHeight || 480,
      title: body.title,
      description: body.description,
      actionType: body.actionType,
      position: body.position || "user-home-main",
      isActive: body.isActive ?? false,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    // Action specific fields
    if (body.actionType === "discount") {
      bannerData.discountType = body.discountType
      bannerData.discountValue = body.discountValue
      bannerData.productSelectionMode = body.productSelectionMode || "manual"
      if (body.productSelectionMode === "auto") {
        bannerData.autoDiscountThreshold = body.autoDiscountThreshold
      }
    } else if (body.actionType === "category") {
      bannerData.targetCategoryId = body.targetCategoryId
    } else if (body.actionType === "product") {
      bannerData.targetProductId = body.targetProductId
    } else if (body.actionType === "url") {
      bannerData.targetUrl = body.targetUrl
    }

    const banner = new Banner(bannerData)
    await banner.save()

    if (body.actionType === "discount" && body.linkedProductIds && body.linkedProductIds.length > 0) {
      await Product.updateMany({ _id: { $in: body.linkedProductIds } }, { $set: { discountBannerId: banner._id } })
    }

    return NextResponse.json(
      {
        success: true,
        data: banner,
        message: "Banner created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ success: false, error: "Failed to create banner" }, { status: 500 })
  }
}
