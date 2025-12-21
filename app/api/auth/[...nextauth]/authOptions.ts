import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendMail } from "@/lib/sendMail";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  debug: process.env.NODE_ENV === "development",

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const { emailOrPhone, password } = credentials as any;
        if (!emailOrPhone || !password) return null;

        const query = emailOrPhone.includes("@")
          ? { email: emailOrPhone.toLowerCase() }
          : { phone: emailOrPhone };

        const user = await User.findOne(query);
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`.trim(),
        };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }

      if (token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
          token.profileCompleted = dbUser.profileCompleted;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as any;
        session.user.role = token.role as any;
        session.user.emailVerified = Boolean(token.emailVerified);
        (session.user as any).profileCompleted = Boolean(
          token.profileCompleted
        );
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // ❗❗ لا Deep Link هنا
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: { signIn: "/login" },
};
