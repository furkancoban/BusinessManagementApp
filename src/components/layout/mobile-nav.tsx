"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Yeni", href: "/orders/new", icon: PlusCircle },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Siparişler", href: "/orders", icon: ShoppingCart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
      <div className="flex h-20 items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/orders/new" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.href === "/orders/new" ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

