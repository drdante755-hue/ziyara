import dbConnect from './mongodb'
import User, { IUser } from '@/models/User'
import bcrypt from 'bcryptjs'

export async function createUser(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role?: 'user' | 'admin'
}) {
  await dbConnect()

  const existing = await User.findOne({ email: data.email.toLowerCase() }).lean()
  if (existing) {
    throw new Error('Email already exists')
  }

  const hashed = await bcrypt.hash(data.password, 10)

  const role = data.role && (data.role === 'admin' ? 'admin' : 'user')

  const user = new User({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    password: hashed,
    role,
  })

  await user.save()
  const u = user.toObject() as Partial<IUser>
  delete (u as any).password
  return u
}
