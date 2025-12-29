import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Doctor from "@/models/Doctor"
import PrivateClinic from "@/models/PrivateClinic"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const specialty = searchParams.get("specialty") || ""
    const city = searchParams.get("city") || ""

    // Build query
    const query: any = {
      type: "private",
      isActive: true,
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameAr: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
        { specialtyAr: { $regex: search, $options: "i" } },
      ]
    }

    if (specialty) {
      query.$or = [
        { specialty: { $regex: specialty, $options: "i" } },
        { specialtyAr: { $regex: specialty, $options: "i" } },
      ]
    }

    // Get doctors
    const doctors = await Doctor.find(query).sort({ rating: -1, reviewCount: -1 }).lean()

    // Get clinic info for each doctor
    const doctorsWithClinics = await Promise.all(
      doctors.map(async (doctor) => {
        const clinic = await PrivateClinic.findOne({
          doctorId: doctor._id,
          isActive: true,
        }).lean()

        // Filter by city if provided
        if (city && clinic && !clinic.location.city.includes(city) && !clinic.location.cityAr.includes(city)) {
          return null
        }

        return {
          ...doctor,
          clinic,
        }
      }),
    )

    // Filter out null values (doctors without clinics or not matching city)
    const filteredDoctors = doctorsWithClinics.filter((d) => d !== null && d.clinic !== null)

    return NextResponse.json({
      success: true,
      doctors: filteredDoctors,
    })
  } catch (error: any) {
    console.error("Error fetching private doctors:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الأطباء",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
