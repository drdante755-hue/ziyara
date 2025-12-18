import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Review from "@/models/Review"
import Booking from "@/models/Booking"
import Provider from "@/models/Provider"
import Clinic from "@/models/Clinic"
import Hospital from "@/models/Hospital"
import User from "@/models/User"

// GET - جلب التقييمات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const clinicId = searchParams.get("clinicId")
    const hospitalId = searchParams.get("hospitalId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = { isVisible: true }

    if (providerId) query.providerId = providerId
    if (clinicId) query.clinicId = clinicId
    if (hospitalId) query.hospitalId = hospitalId

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ])

    const transformedReviews = reviews.map((review: any) => ({
      id: review._id.toString(),
      user: review.userId
        ? {
            name: `${review.userId.firstName} ${review.userId.lastName?.charAt(0) || ""}.`,
          }
        : { name: "مستخدم" },
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      response: review.response,
      isVerified: review.isVerified,
      createdAt: review.createdAt,
    }))

    return NextResponse.json({
      success: true,
      reviews: transformedReviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب التقييمات" }, { status: 500 })
  }
}

// POST - إضافة تقييم جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const body = await request.json()
    const { bookingId, rating, title, comment, type } = body

    if (!bookingId || !rating || !type) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    // التحقق من وجود الحجز وأنه مكتمل
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.json({ success: false, error: "الحجز غير موجود" }, { status: 404 })
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ success: false, error: "يمكن التقييم فقط بعد اكتمال الحجز" }, { status: 400 })
    }

    // التحقق من ��دم وجود تقييم سابق
    const existingReview = await Review.findOne({ bookingId, userId: user._id, type })
    if (existingReview) {
      return NextResponse.json({ success: false, error: "تم التقييم مسبقاً" }, { status: 400 })
    }

    const review = await Review.create({
      userId: user._id,
      bookingId,
      providerId: type === "provider" ? booking.providerId : undefined,
      clinicId: type === "clinic" ? booking.clinicId : undefined,
      hospitalId: type === "hospital" ? booking.hospitalId : undefined,
      type,
      rating,
      title,
      comment,
      isVerified: true,
      isVisible: true,
    })

    // تحديث متوسط التقييم
    if (type === "provider" && booking.providerId) {
      const provider = await Provider.findById(booking.providerId)
      if (provider) {
        const totalRatings = provider.reviewsCount * provider.rating + rating
        provider.reviewsCount += 1
        provider.rating = Number((totalRatings / provider.reviewsCount).toFixed(1))
        await provider.save()
      }
    } else if (type === "clinic" && booking.clinicId) {
      const clinic = await Clinic.findById(booking.clinicId)
      if (clinic) {
        const totalRatings = clinic.reviewsCount * clinic.rating + rating
        clinic.reviewsCount += 1
        clinic.rating = Number((totalRatings / clinic.reviewsCount).toFixed(1))
        await clinic.save()
      }
    } else if (type === "hospital" && booking.hospitalId) {
      const hospital = await Hospital.findById(booking.hospitalId)
      if (hospital) {
        const totalRatings = hospital.reviewsCount * hospital.rating + rating
        hospital.reviewsCount += 1
        hospital.rating = Number((totalRatings / hospital.reviewsCount).toFixed(1))
        await hospital.save()
      }
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review._id.toString(),
        rating: review.rating,
      },
    })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ success: false, error: "فشل في إضافة التقييم" }, { status: 500 })
  }
}
