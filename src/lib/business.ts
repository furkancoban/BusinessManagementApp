import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getBusinessId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId || null;
}

export async function requireBusinessId(): Promise<string> {
  const businessId = await getBusinessId();
  if (!businessId) {
    throw new Error("NO_BUSINESS");
  }
  return businessId;
}

