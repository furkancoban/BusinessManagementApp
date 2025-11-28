"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  PlusCircle,
  Settings,
  BarChart3,
  Store,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Ürünler",
    href: "/products",
    icon: Package,
  },
  {
    name: "Siparişler",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Veresiye Siparişler",
    href: "/orders/unpaid",
    icon: CreditCard,
  },
  {
    name: "Yeni Sipariş",
    href: "/orders/new",
    icon: PlusCircle,
  },
  {
    name: "Raporlar",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, toggle } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
          isOpen ? "lg:w-72" : "lg:w-0"
        )}
      >
        <div
          className={cn(
            "flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card pb-4 transition-all duration-300",
            isOpen ? "px-6" : "px-0"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "flex h-20 shrink-0 items-center gap-3 transition-all duration-300",
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary flex-shrink-0">
              <Store className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold text-foreground truncate max-w-[180px]">
                {session?.user?.businessName || "İşletme Yönetim"}
              </span>
              <span className="text-xs text-muted-foreground">Yönetim Sistemi</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-xl text-base font-medium leading-6 transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isOpen ? "p-4" : "p-3 justify-center"
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        )}
                        aria-hidden="true"
                      />
                      {isOpen && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Toggle Button */}
          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="w-full justify-center"
              title={isOpen ? "Sidebar'ı kapat" : "Sidebar'ı aç"}
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="fixed left-4 top-24 z-40 hidden lg:flex h-10 w-10 rounded-full shadow-lg"
          title="Sidebar'ı aç"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
