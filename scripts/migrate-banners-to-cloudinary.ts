/**
 * Migration script to convert existing base64 banners to Cloudinary-hosted images
 *
 * Run this script once to migrate existing banners:
 * npx ts-node scripts/migrate-banners-to-cloudinary.ts
 *
 * Or via Node with compiled JS
 */

import dbConnect from "../lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import mongoose from "mongoose"

// Temporary schema that includes both old and new fields
const MigrationBannerSchema = new mongoose.Schema(
  {
    imageData: String,
    imageUrl: String,
    imagePublicId: String,
    imageMimeType: String,
    imageWidth: Number,
    imageHeight: Number,
    title: String,
  },
  { strict: false },
)

async function migrateBanners() {
  try {
    await dbConnect()

    const MigrationBanner =
      mongoose.models.MigrationBanner || mongoose.model("MigrationBanner", MigrationBannerSchema, "banners")

    // Find banners with imageData but no imagePublicId (legacy)
    const legacyBanners = await MigrationBanner.find({
      imageData: { $exists: true, $ne: null },
      imagePublicId: { $exists: false },
    }).lean()

    console.log(`Found ${legacyBanners.length} legacy banners to migrate`)

    for (const banner of legacyBanners) {
      try {
        console.log(`Migrating banner: ${banner._id} - ${banner.title}`)

        // Upload to Cloudinary
        const result = await uploadToCloudinary(banner.imageData, `banner-migration-${banner._id}`)

        // Update the banner record
        await MigrationBanner.updateOne(
          { _id: banner._id },
          {
            $set: {
              imageUrl: result.imageUrl,
              imagePublicId: result.imagePublicId,
              imageWidth: result.width || banner.imageWidth,
              imageHeight: result.height || banner.imageHeight,
            },
            $unset: { imageData: "" },
          },
        )

        console.log(`  ✓ Migrated successfully: ${result.imageUrl}`)
      } catch (err) {
        console.error(`  ✗ Migration failed for banner ${banner._id}:`, err)
      }
    }

    console.log("\nMigration complete!")
    process.exit(0)
  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  }
}

migrateBanners()
