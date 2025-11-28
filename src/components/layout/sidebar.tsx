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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Siparişler", href: "/orders", icon: ShoppingCart },
  { name: "Yeni Sipariş", href: "/orders/new", icon: PlusCircle, highlight: true },
  { name: "Raporlar", href: "/reports", icon: BarChart3 },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 pb-4 mt-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white truncate max-w-[160px]">
              {session?.user?.businessName || "İşletme Yönetim"}
            </span>
            <span className="text-xs text-slate-400">Yönetim Sistemi</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col mt-2">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-xl p-3.5 text-sm font-medium leading-6 transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : item.highlight
                        ? "text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 border border-dashed border-slate-600 hover:border-emerald-500/50"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                      )}
                    />
                    {item.name}
                    {item.highlight && !isActive && (
                      <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        Hızlı
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-4 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Performans</p>
                  <p className="text-xs text-slate-400">Raporları inceleyin</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
