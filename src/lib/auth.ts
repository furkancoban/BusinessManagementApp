import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gereklidir");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            businesses: {
              where: { business: { isActive: true } },
              include: {
                business: true,
              },
              orderBy: { isDefault: "desc" },
            },
          },
        });

        if (!user || !user.isActive) {
          throw new Error("Geçersiz e-posta veya şifre");
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error("Lütfen önce e-posta adresinizi doğrulayın");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Geçersiz e-posta veya şifre");
        }

        // Get default business or first business
        const defaultBusiness = user.businesses.find((ub) => ub.isDefault) || user.businesses[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          businessId: defaultBusiness?.businessId || null,
          businessName: defaultBusiness?.business.name || null,
          businessSlug: defaultBusiness?.business.slug || null,
          role: defaultBusiness?.role || "STAFF",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.businessId = user.businessId;
        token.businessName = user.businessName;
        token.businessSlug = user.businessSlug;
        token.role = user.role;
      }
      
      // Handle business switch
      if (trigger === "update" && session?.businessId) {
        token.businessId = session.businessId;
        token.businessName = session.businessName;
        token.businessSlug = session.businessSlug;
        token.role = session.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.businessId = token.businessId as string | null;
        session.user.businessName = token.businessName as string | null;
        session.user.businessSlug = token.businessSlug as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
