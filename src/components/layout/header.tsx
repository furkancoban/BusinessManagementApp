"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
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
  Bell,
  ChevronDown,
  AlertTriangle,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BusinessSwitcher } from "./business-switcher";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!session,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.notifications || {};
  const allNotifications = [
    ...(notifications.outOfStock || []),
    ...(notifications.lowStock || []),
    ...(notifications.todayOrders || []),
  ];
  const totalCount = notificationsData?.totalCount || 0;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white/80 backdrop-blur-lg px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="h-6 w-px bg-slate-200 lg:hidden" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Mobile Logo */}
          <div className="flex items-center lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                İşletme Yönetim
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-x-3 lg:gap-x-4">
            {/* Business Switcher */}
            <BusinessSwitcher />

            {/* Notifications */}
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                  <Bell className="h-5 w-5 text-slate-500" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                      {totalCount > 9 ? "9+" : totalCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold text-slate-900">Bildirimler</h3>
                  {totalCount > 0 && (
                    <Badge variant="destructive" className="h-5">
                      {totalCount}
                    </Badge>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {allNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Bell className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-900">Bildirim yok</p>
                      <p className="text-xs text-slate-500 mt-1">Tüm bildirimler burada görünecek</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {allNotifications.map((notification: any) => {
                        const getIcon = () => {
                          if (notification.type === "out_of_stock") {
                            return <XCircle className="h-4 w-4 text-red-500" />;
                          }
                          if (notification.type === "low_stock") {
                            return <AlertTriangle className="h-4 w-4 text-orange-500" />;
                          }
                          if (notification.type === "today_orders") {
                            return <ShoppingBag className="h-4 w-4 text-blue-500" />;
                          }
                          return <Bell className="h-4 w-4 text-slate-400" />;
                        };

                        const getBadgeVariant = () => {
                          if (notification.type === "out_of_stock") return "destructive";
                          if (notification.type === "low_stock") return "default";
                          return "secondary";
                        };

                        return (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (notification.productId) {
                                router.push(`/products/${notification.productId}/edit`);
                                setNotificationOpen(false);
                              } else if (notification.type === "today_orders") {
                                router.push("/orders");
                                setNotificationOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getIcon()}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                                {notification.stockQuantity !== undefined && (
                                  <Badge variant={getBadgeVariant()} className="mt-2 text-xs">
                                    Stok: {notification.stockQuantity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {allNotifications.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        router.push("/reports");
                        setNotificationOpen(false);
                      }}
                    >
                      Tüm Raporları Görüntüle
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:flex lg:flex-col lg:items-start">
                    <span className="text-sm font-medium text-slate-900">
                      {session?.user?.name || "Kullanıcı"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {session?.user?.role === "ADMIN" ? "Yönetici" : "Personel"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 p-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">{session?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      <Badge variant="secondary" className="mt-1 w-fit">
                        {session?.user?.role === "ADMIN" ? "Yönetici" : "Personel"}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer p-2 rounded-lg">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer p-2 rounded-lg focus:bg-red-50 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-6 animate-slide-in-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">İşletme Yönetim</span>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {session?.user?.businessName && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-400">Aktif İşletme</p>
                <p className="font-semibold text-white mt-1">{session.user.businessName}</p>
              </div>
            )}

            {/* Mobile Notifications */}
            <div className="mt-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-xl p-4 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {totalCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                          {totalCount > 9 ? "9+" : totalCount}
                        </span>
                      )}
                    </div>
                    Bildirimler
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[calc(100vw-3rem)] max-w-sm p-0">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-semibold text-slate-900">Bildirimler</h3>
                    {totalCount > 0 && (
                      <Badge variant="destructive" className="h-5">
                        {totalCount}
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {allNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Bell className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-900">Bildirim yok</p>
                        <p className="text-xs text-slate-500 mt-1">Tüm bildirimler burada görünecek</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {allNotifications.map((notification: any) => {
                          const getIcon = () => {
                            if (notification.type === "out_of_stock") {
                              return <XCircle className="h-4 w-4 text-red-500" />;
                            }
                            if (notification.type === "low_stock") {
                              return <AlertTriangle className="h-4 w-4 text-orange-500" />;
                            }
                            if (notification.type === "today_orders") {
                              return <ShoppingBag className="h-4 w-4 text-blue-500" />;
                            }
                            return <Bell className="h-4 w-4 text-slate-400" />;
                          };

                          const getBadgeVariant = () => {
                            if (notification.type === "out_of_stock") return "destructive";
                            if (notification.type === "low_stock") return "default";
                            return "secondary";
                          };

                          return (
                            <div
                              key={notification.id}
                              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                if (notification.productId) {
                                  router.push(`/products/${notification.productId}/edit`);
                                } else if (notification.type === "today_orders") {
                                  router.push("/orders");
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon()}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                                  <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                                  {notification.stockQuantity !== undefined && (
                                    <Badge variant={getBadgeVariant()} className="mt-2 text-xs">
                                      Stok: {notification.stockQuantity}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {allNotifications.length > 0 && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/reports");
                        }}
                      >
                        Tüm Raporları Görüntüle
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <nav className="mt-8">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-xl p-4 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
