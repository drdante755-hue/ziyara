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
          phone: user.phone,
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
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
              },
            },
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                emailVerified: profile.email_verified ?? false,
                role: "user",
              };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.role = (user as any).role;
        token.name = (user as any).name;
      }

      if (token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
          token.profileCompleted = dbUser.profileCompleted || false;
          token.verified = dbUser.verified || false;
          token.emailVerified = dbUser.emailVerified || false;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`.trim();
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as any;
        session.user.role = token.role as any;
        session.user.emailVerified = Boolean(token.emailVerified);
        (session.user as any).profileCompleted = Boolean(token.profileCompleted);
        session.user.name = token.name as any;
        session.user.email = token.email as any;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        if (account?.provider === "google" && user.email) {
          const existing = await User.findOne({ email: user.email });

          if (!existing) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashed = await bcrypt.hash(randomPassword, 10);
            const verificationCode = generateCode();
            const codeExpires = new Date(Date.now() + 5 * 60 * 1000);

            await User.create({
              email: user.email,
              firstName: (profile as any)?.given_name || "User",
              lastName: (profile as any)?.family_name || "Google",
              password: hashed,
              role: "user",
              verified: false,
              emailVerified: false,
              verificationCode,
              codeExpires,
              verificationAttempts: 0,
              otpResendCount: 0,
              profileCompleted: false,
            });

            try {
              await sendMail(user.email, verificationCode);
            } catch (err) {
              console.error("Failed to send OTP:", err);
            }
          }
        }

        return true;
      } catch (err) {
        console.error("signIn error:", err);
        return true;
      }
    },

    async redirect({ url, baseUrl }) {
      if (!url) return baseUrl;

      const isInternal = url.startsWith("/") || url.startsWith(baseUrl);
      if (isInternal) return url.startsWith("/") ? `${baseUrl}${url}` : url;

      return baseUrl;
    },
  },

  pages: { signIn: "/login" },
};
