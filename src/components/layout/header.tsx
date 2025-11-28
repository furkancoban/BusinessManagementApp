"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  PlusCircle,
  BarChart3,
  Store,
  PanelLeft,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BusinessSwitcher } from "./business-switcher";
import { GlobalSearch } from "@/components/shared/global-search";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const navigation = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Siparişler", href: "/orders", icon: ShoppingCart },
  { name: "Yeni Sipariş", href: "/orders/new", icon: PlusCircle },
  { name: "Raporlar", href: "/reports", icon: BarChart3 },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggle: toggleSidebar } = useSidebar();

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60000,
  });

  const notifications = notificationsData?.notifications || {};
  const allNotifications = [
    ...(notifications.lowStock || []),
    ...(notifications.outOfStock || []),
    ...(notifications.todayOrders || []),
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Menüyü aç</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Desktop sidebar toggle button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground hidden lg:block hover:text-foreground transition-colors"
          onClick={toggleSidebar}
        >
          <span className="sr-only">Sidebar'ı aç/kapat</span>
          <PanelLeft className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center gap-4">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">İşletme Yönetim</span>
            </Link>
            {/* Global Search - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-x-3 lg:gap-x-4">
            {/* Business Switcher */}
            <BusinessSwitcher />

            {/* Notifications */}
            {notificationsData?.totalCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationsData.totalCount > 9 ? "9+" : notificationsData.totalCount}
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">Bildirimler</h4>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {allNotifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Bildirim yok
                      </div>
                    ) : (
                      <div className="divide-y">
                        {allNotifications.slice(0, 10).map((notification: any) => (
                          <Link
                            key={notification.id}
                            href={
                              notification.type === "low_stock" || notification.type === "out_of_stock"
                                ? `/products/${notification.productId}/edit`
                                : "/orders"
                            }
                            className="block p-4 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1.5 rounded-full ${
                                notification.type === "out_of_stock" ? "bg-red-100" :
                                notification.type === "low_stock" ? "bg-orange-100" :
                                "bg-blue-100"
                              }`}>
                                {notification.type === "out_of_stock" ? (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                ) : notification.type === "low_stock" ? (
                                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="hidden text-base font-medium lg:block">
                    {session?.user?.name || "Kullanıcı"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-sm leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    {session?.user?.role && (
                      <p className="text-xs leading-none text-primary mt-1">
                        {session.user.role === "ADMIN" ? "Yönetici" : "Personel"}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-background px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">İşletme Yönetim</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Menüyü kapat</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Business info in mobile menu */}
            {session?.user?.businessName && (
              <div className="mt-4 p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Aktif İşletme:</p>
                <p className="font-semibold">{session.user.businessName}</p>
              </div>
            )}

            <nav className="mt-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl p-4 text-base font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-6 w-6" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
