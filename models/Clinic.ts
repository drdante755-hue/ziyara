import { Schema, model, models, type Document } from "mongoose"

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
  cancellationDeadlineHours: number // Hours before appointment when cancellation is allowed
  cancellationFee?: number // Fee charged for late cancellation (percentage or fixed amount)
  cancellationFeeType?: "percentage" | "fixed"

  // Rescheduling policy
  allowRescheduling: boolean
  reschedulingDeadlineHours: number
  maxRescheduleCount?: number

  // Booking rules
  minAdvanceBookingHours: number // Minimum hours in advance for booking
  maxAdvanceBookingDays: number // Maximum days in advance for booking
  requirePaymentUpfront: boolean
  allowWalletPayment: boolean
  allowCashPayment: boolean

  // No-show policy
  noShowFee?: number
  noShowFeeType?: "percentage" | "fixed"

  // Other policies
  requireConfirmation: boolean // Whether clinic staff needs to confirm booking
  autoConfirmAfterPayment: boolean
  sendReminders: boolean
  reminderHoursBefore?: number[]
}

export interface IClinic extends Document {
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  address: string
  city: string
  area: string
  phone: string
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

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    description: String,
    descriptionAr: String,

    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },

    phone: { type: String, required: true },
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
  },
  { timestamps: true },
)

const Clinic = models.Clinic || model<IClinic>("Clinic", ClinicSchema)

export default Clinic
// Note: The default values for bookingPolicies will be set according to the schema defaults.