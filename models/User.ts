import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  password: string
  role: "user" | "admin"
  verified?: boolean // Keep for backward compatibility
  emailVerified?: boolean // New field for email verification
  verificationCode?: string
  verificationAttempts?: number
  codeExpires?: Date
  otpResendCount?: number // ✅ Track OTP resend attempts
  lastOtpResendAt?: Date // ✅ Track last OTP resend time
  profileCompleted?: boolean
  age?: number
  walletBalance: number
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "delivery"], default: "user" },
    verified: { type: Boolean, default: false }, // Keep for backward compatibility
    emailVerified: { type: Boolean, default: false }, // New field for email verification
    verificationCode: { type: String, required: false },
    verificationAttempts: { type: Number, default: 0 },
    codeExpires: { type: Date, required: false },
    otpResendCount: { type: Number, default: 0 }, // ✅ Track OTP resend attempts
    lastOtpResendAt: { type: Date, required: false }, // ✅ Track last OTP resend time
    profileCompleted: { type: Boolean, default: false },
    age: { type: Number, required: false },
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
)

// Prevent model overwrite upon hot-reload in development
const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema)

export default User
