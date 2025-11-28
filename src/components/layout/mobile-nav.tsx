"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  PlusCircle,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Yeni", href: "/orders/new", icon: PlusCircle },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Siparişler", href: "/orders", icon: ShoppingCart },
  { name: "Veresiye", href: "/orders/unpaid", icon: CreditCard },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden shadow-lg">
      <div className="flex h-20 items-center justify-around px-1 overflow-x-auto scrollbar-hide">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/orders/new" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 transition-all min-w-[60px] flex-shrink-0",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.href === "/orders/new" ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-tight text-center">{item.name}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

