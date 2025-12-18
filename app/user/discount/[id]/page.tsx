import DiscountClientPage from "./DiscountClientPage"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import Banner from "@/models/Banner"
import Product from "@/models/Product"

interface DiscountPageProps {
  params: Promise<{ id: string }> // params is now a Promise in Next.js 15
}

interface SerializedBanner {
  _id: string
  title: string
  imageUrl: string
  discountType?: "percentage" | "fixed"
  discountValue?: number
}

interface SerializedProduct {
  _id: string
  name: string
  nameAr?: string
  price: number
  salePrice?: number
  discount?: number
  images: string[]
  imageUrl?: string
  stock: number
  isActive: boolean
  category: string
}

export async function generateMetadata(props: DiscountPageProps) {
  const { id } = await props.params // await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      title: "صفحة غير موجودة",
      description: "الصفحة المطلوبة غير موجودة.",
    }
  }

  try {
    await dbConnect()
    const bannerId = new mongoose.Types.ObjectId(id)
    const banner = await Banner.findById(bannerId).lean()

    if (!banner) {
      return {
        title: "عرض خاص غير موجود",
        description: "العرض الخاص الذي تبحث عنه غير موجود.",
      }
    }

    return {
      title: `عرض خاص - ${banner.title}`,
      description: `اكتشف منتجاتنا المميزة بأسعار خاصة في عرض ${banner.title}`,
    }
  } catch (error) {
    console.error("Error generating metadata for discount page:", error)
    return {
      title: "خطأ في تحميل العرض",
      description: "حدث خطأ أثناء تحميل تفاصيل العرض.",
    }
  }
}

export default async function DiscountPage(props: DiscountPageProps) {
  const { id } = await props.params // await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <DiscountClientPage error="Invalid banner ID" />
  }

  try {
    await dbConnect()

    const bannerId = new mongoose.Types.ObjectId(id)

    const [bannerDoc, productsDoc] = await Promise.all([
      Banner.findById(bannerId).lean(),
      Product.find({ discountBannerId: bannerId, isActive: true }).lean(),
    ])

    if (!bannerDoc) {
      return <DiscountClientPage error="Banner not found" />
    }

    const banner: SerializedBanner = JSON.parse(JSON.stringify(bannerDoc))
    const products: SerializedProduct[] = JSON.parse(JSON.stringify(productsDoc))

    const discountInfo = {
      type: banner.discountType || "percentage",
      value: banner.discountValue || 0,
    }

    const discountText =
      discountInfo.type === "percentage" ? `-${discountInfo.value}%` : `- ${discountInfo.value.toFixed(2)} ج.م`

    return <DiscountClientPage banner={banner} products={products} discountText={discountText} bannerId={id} />
  } catch (error) {
    console.error("Error loading discount page:", error)
    return <DiscountClientPage error="An error occurred" />
  }
}
