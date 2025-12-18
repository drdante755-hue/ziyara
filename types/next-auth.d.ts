import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    phone?: string
    role: "user" | "admin"
    name?: string | null
    emailVerified?: boolean
    profileCompleted?: boolean // ✅ Add this
  }

  interface Session {
    user: {
      id: string
      email: string
      phone?: string
      role: "user" | "admin"
      name?: string | null
      image?: string | null
      emailVerified?: boolean
      profileCompleted?: boolean // ✅ Add this
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "user" | "admin"
        phone?: string
    profileCompleted?: boolean
    emailVerified?: boolean
    verified?: boolean
    email?: string // ✅ Add this to ensure email is in token
  }
}
