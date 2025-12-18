import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

/**
 * Upload base64 image to Cloudinary
 * @param base64 data:image/...;base64,...
 * @param folder Cloudinary folder (default: banners)
 */
export async function uploadToCloudinary(
  base64: string,
  folder: string = "banners"
) {
  if (!base64) {
    throw new Error("No image data provided")
  }

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
  })

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export async function deleteFromCloudinary(publicId: string) {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId)
}
