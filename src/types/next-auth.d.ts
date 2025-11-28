import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      businessId: string | null;
      businessName: string | null;
      businessSlug: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    businessId: string | null;
    businessName: string | null;
    businessSlug: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    businessId: string | null;
    businessName: string | null;
    businessSlug: string | null;
  }
}

