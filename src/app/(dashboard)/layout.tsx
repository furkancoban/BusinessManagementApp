"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Loading } from "@/components/shared/loading";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen } = useSidebar();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen ? "lg:pl-72" : "lg:pl-0"
      )}>
        <Header />

        <main className="py-8 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

