"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Calendar,
  Crown,
  UserPlus,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

async function fetchDashboardStats() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className = "",
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  trendLabel?: string;
  className?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className={`relative overflow-hidden h-full ${className}`}>
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 transform translate-x-5 -translate-y-5 sm:translate-x-6 sm:-translate-y-6">
        <div className={`w-full h-full rounded-full ${iconBg} opacity-20`} />
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight break-words">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 flex-wrap">
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                )}
                <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {trend >= 0 ? "+" : ""}{trend}%
                </span>
                {trendLabel && <span className="text-xs text-muted-foreground hidden sm:inline">{trendLabel}</span>}
              </div>
            )}
          </div>
          <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${iconBg} shrink-0`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-lg">
        <p className="text-xs font-medium mb-0.5">{label}</p>
        <p className="text-sm font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <PageHeader title="Genel Bakış" description="İşletmenizin güncel durumu" />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 sm:h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 sm:h-64" />
          <Skeleton className="h-56 sm:h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="İşletmenizin güncel durumu"
        actions={
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm">
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Sipariş</span>
              <span className="sm:hidden">Yeni</span>
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Bugünkü Satışlar"
          value={formatCurrency(stats?.todaySales || 0)}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Aylık Satışlar"
          value={formatCurrency(stats?.monthlySales || 0)}
          icon={TrendingUp}
          trend={stats?.salesTrend}
          trendLabel="geçen aya göre"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Aylık Kar"
          value={formatCurrency(stats?.monthlyProfit || 0)}
          icon={Crown}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Bugünkü Siparişler"
          value={stats?.todayOrderCount || 0}
          icon={ShoppingCart}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Quick Stats */}
      <div className={`grid gap-3 ${stats?.unpaidVeresiyeCount > 0 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-100">Toplam Müşteri</p>
                <p className="text-2xl sm:text-3xl font-bold mt-0.5 break-words">{stats?.customerCount || 0}</p>
              </div>
              <Users className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-emerald-100">Toplam Ürün</p>
                <p className="text-2xl sm:text-3xl font-bold mt-0.5 break-words">{stats?.productCount || 0}</p>
              </div>
              <Package className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-100">Aylık Siparişler</p>
                <p className="text-2xl sm:text-3xl font-bold mt-0.5 break-words">{stats?.monthlyOrderCount || 0}</p>
              </div>
              <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-amber-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        {stats?.unpaidVeresiyeCount > 0 && (
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white h-full border-2 border-orange-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-orange-100">Ödenmemiş Veresiye</p>
                  <p className={`font-bold mt-0.5 break-words leading-tight ${
                    (stats?.unpaidVeresiyeAmount || 0) >= 1000000
                      ? "text-base sm:text-lg lg:text-xl"
                      : (stats?.unpaidVeresiyeAmount || 0) >= 100000
                      ? "text-lg sm:text-xl lg:text-2xl"
                      : (stats?.unpaidVeresiyeAmount || 0) >= 10000
                      ? "text-xl sm:text-2xl lg:text-3xl"
                      : "text-2xl sm:text-3xl"
                  }`}>
                    {formatCurrency(stats?.unpaidVeresiyeAmount || 0)}
                  </p>
                  <p className="text-xs text-orange-100 mt-1">{stats?.unpaidVeresiyeCount || 0} sipariş</p>
                </div>
                <Receipt className="h-7 w-7 sm:h-8 sm:w-8 text-orange-200 shrink-0" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="h-full">
          <CardHeader className="pb-2.5 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              Son 7 Gün Satışları
            </CardTitle>
            <CardDescription className="text-xs">Günlük satış trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-56 lg:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailySales || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} width={45} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="h-full">
          <CardHeader className="pb-2.5 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Package className="h-4 w-4 text-primary shrink-0" />
              En Çok Satan Ürünler
            </CardTitle>
            <CardDescription className="text-xs">Satış miktarına göre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-56 lg:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProducts || []} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Gelir"]}
                    labelFormatter={(label) => `Ürün: ${label}`}
                    contentStyle={{ fontSize: "11px" }}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {(stats?.topProducts || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Recent Orders */}
        <Card className="xl:col-span-2 h-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 sm:pb-3">
            <div>
              <CardTitle className="text-sm sm:text-base">Son Siparişler</CardTitle>
              <CardDescription className="text-xs">En son oluşturulan siparişler</CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-xs h-8">
                Tümünü Gör
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders?.length ? (
              <div className="space-y-2">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.customer?.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm sm:text-base">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{formatDateTime(order.orderDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 opacity-20" />
                <p className="text-sm">Henüz sipariş yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-3 sm:space-y-4">
          {/* Low Stock Alert */}
          <Card className="border-amber-200 bg-amber-50/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                Düşük Stok
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.lowStockProducts?.length ? (
                <div className="space-y-2">
                  {stats.lowStockProducts.slice(0, 4).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate flex-1 min-w-0">{product.name}</span>
                      <Badge variant={product.stockQuantity === 0 ? "destructive" : "secondary"} className="text-xs shrink-0 h-5">
                        {product.stockQuantity} adet
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Tüm ürünler yeterli stokta</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Cards - Side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Top Customers */}
            <Card className="h-full">
              <CardHeader className="pb-2.5">
                <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
                  En İyi Müşteriler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {stats?.topCustomers?.length ? (
                  <>
                    {stats.topCustomers.slice(0, 4).map((customer: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: COLORS[index] }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate">{customer.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{customer.orders} sipariş</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-primary">{formatCurrency(customer.spent)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Henüz veri yok</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card className="h-full">
              <CardHeader className="pb-2.5">
                <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />
                  Yeni Müşteriler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {stats?.recentCustomers?.length ? (
                  <>
                    {stats.recentCustomers.slice(0, 4).map((customer: any) => (
                      <Link
                        key={customer.id}
                        href={`/customers/${customer.id}`}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0 font-semibold text-xs group-hover:bg-emerald-200 transition-colors">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {customer._count?.orders || 0} sipariş
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Henüz müşteri yok</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
