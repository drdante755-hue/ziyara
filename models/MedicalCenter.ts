import { Schema, model, models, type Document, type Model } from "mongoose"

export interface IBookingMethod {
  type: "in_clinic" | "online" | "home_visit"
  enabled: boolean
  price?: number
  description?: string
  descriptionAr?: string
}

export interface IBookingPolicy {
  // Cancellation policy
  allowCancellation: boolean
  cancellationDeadlineHours: number
  cancellationFee?: number
  cancellationFeeType?: "percentage" | "fixed"

  // Rescheduling policy
  allowRescheduling: boolean
  reschedulingDeadlineHours: number
  maxRescheduleCount?: number

  // Booking rules
  minAdvanceBookingHours: number
  maxAdvanceBookingDays: number
  requirePaymentUpfront: boolean
  allowWalletPayment: boolean
  allowCashPayment: boolean

  // No-show policy
  noShowFee?: number
  noShowFeeType?: "percentage" | "fixed"

  // Other policies
  requireConfirmation: boolean
  autoConfirmAfterPayment: boolean
  sendReminders: boolean
  reminderHoursBefore?: number[]
}

export interface IAddress {
  street: string
  city: string
  area: string
  governorate: string
}

export interface IMedicalCenter extends Document {
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  address: IAddress
  city: string
  area: string
  governorate?: string
  phone: string[]
  email?: string
  specialties: string[]
  workingHours: any[]
  images: string[]
  logo?: string
  amenities: string[]
  insuranceAccepted: string[]
  isActive: boolean
  isFeatured: boolean
  rating: number
  reviewsCount: number
  bookingMethods: IBookingMethod[]
  bookingPolicies: IBookingPolicy
  establishedYear?: number
  licenseNumber?: string
  numberOfDoctors?: number
  numberOfBeds?: number
  emergencyServices: boolean
  hasParking: boolean
  hasLaboratory: boolean
  hasPharmacy: boolean
}

const BookingMethodSchema = new Schema<IBookingMethod>(
  {
    type: {
      type: String,
      enum: ["in_clinic", "online", "home_visit"],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    price: { type: Number },
    description: { type: String },
    descriptionAr: { type: String },
  },
  { _id: false },
)

const BookingPolicySchema = new Schema<IBookingPolicy>(
  {
    // Cancellation policy
    allowCancellation: { type: Boolean, default: true },
    cancellationDeadlineHours: { type: Number, default: 24 },
    cancellationFee: { type: Number, default: 0 },
    cancellationFeeType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    // Rescheduling policy
    allowRescheduling: { type: Boolean, default: true },
    reschedulingDeadlineHours: { type: Number, default: 24 },
    maxRescheduleCount: { type: Number, default: 2 },

    // Booking rules
    minAdvanceBookingHours: { type: Number, default: 1 },
    maxAdvanceBookingDays: { type: Number, default: 30 },
    requirePaymentUpfront: { type: Boolean, default: false },
    allowWalletPayment: { type: Boolean, default: true },
    allowCashPayment: { type: Boolean, default: true },

    // No-show policy
    noShowFee: { type: Number, default: 0 },
    noShowFeeType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    // Other policies
    requireConfirmation: { type: Boolean, default: false },
    autoConfirmAfterPayment: { type: Boolean, default: true },
    sendReminders: { type: Boolean, default: true },
    reminderHoursBefore: { type: [Number], default: [24, 2] },
  },
  { _id: false },
)

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    governorate: { type: String, required: true },
  },
  { _id: false },
)

const MedicalCenterSchema = new Schema<IMedicalCenter>(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    description: String,
    descriptionAr: String,

    address: { type: AddressSchema, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    governorate: String,

    phone: { type: [String], required: true },
    email: String,

    specialties: [{ type: String }],
    workingHours: [{ type: Object }],

    images: [{ type: String }],
    logo: String,

    amenities: [{ type: String }],
    insuranceAccepted: [{ type: String }],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    bookingMethods: {
      type: [BookingMethodSchema],
      default: [
        { type: "in_clinic", enabled: true },
        { type: "online", enabled: false },
        { type: "home_visit", enabled: false },
      ],
    },
    bookingPolicies: {
      type: BookingPolicySchema,
      default: () => ({}),
    },

    establishedYear: Number,
    licenseNumber: String,
    numberOfDoctors: { type: Number, default: 0 },
    numberOfBeds: { type: Number, default: 0 },
    emergencyServices: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasLaboratory: { type: Boolean, default: false },
    hasPharmacy: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const MedicalCenter: Model<IMedicalCenter> =
  (models.MedicalCenter as Model<IMedicalCenter>) || model<IMedicalCenter>("MedicalCenter", MedicalCenterSchema)

export default MedicalCenter
