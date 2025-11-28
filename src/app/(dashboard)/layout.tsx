"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();

  // Refresh session on mount to ensure we have the latest business name from database
  useEffect(() => {
    if (session?.user?.businessId) {
      // Fetch latest business info and update session
      fetch("/api/session/refresh", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.businessName && data.businessName !== session.user.businessName) {
            update({
              businessId: data.businessId,
              businessName: data.businessName,
              businessSlug: data.businessSlug,
              role: session.user.role,
            });
          }
        })
        .catch((error) => console.error("Session refresh error:", error));
    }
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
