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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Store className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
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
                      "group flex gap-x-3 rounded-xl p-4 text-base font-medium leading-6 transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
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
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
