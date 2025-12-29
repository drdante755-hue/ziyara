import "dotenv/config"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

async function migrate() {
  try {
    console.log("[v0] Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("[v0] Connected successfully")

    const db = mongoose.connection.db
    const providersCollection = db.collection("providers")

    console.log("[v0] Starting migration: hospitalId → medicalCenterId")

    const providersWithHospitalId = await providersCollection
      .find({ hospitalId: { $exists: true } })
      .toArray()

    console.log(`[v0] Found ${providersWithHospitalId.length} providers with hospitalId`)

    let updatedCount = 0
    let skippedCount = 0

    for (const provider of providersWithHospitalId) {
      if (provider.medicalCenterId) {
        console.log(
          `[v0] Provider ${provider.name} already has medicalCenterId, skipping...`,
        )
        skippedCount++
        continue
      }

      await providersCollection.updateOne(
        { _id: provider._id },
        {
          $set: { medicalCenterId: provider.hospitalId },
          $unset: { hospitalId: "" },
        },
      )

      console.log(`[v0] Updated provider: ${provider.name} (${provider._id})`)
      updatedCount++
    }

    console.log("[v0] ========================================")
    console.log("[v0] Migration complete!")
    console.log(`[v0] Updated: ${updatedCount} providers`)
    console.log(`[v0] Skipped: ${skippedCount} providers`)
    console.log("[v0] ========================================")

    await mongoose.disconnect()
    console.log("[v0] Disconnected from MongoDB")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

migrate()
