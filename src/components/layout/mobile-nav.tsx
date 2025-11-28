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
      <div className="relative">
        <div className="flex h-20 items-center justify-start gap-0 px-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/orders/new" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-2 transition-all min-w-[56px] flex-shrink-0 snap-start",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.href === "/orders/new" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md">
                    <item.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                ) : (
                  <>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-[10px] font-medium leading-tight text-center whitespace-nowrap">{item.name}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
        {/* Fade gradient to indicate scrollable content */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
      </div>
    </nav>
  );
}

