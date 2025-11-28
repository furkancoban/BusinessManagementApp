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
  Award,
  Activity,
  BarChart3,
  Star,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime, paymentTypeLabels } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

async function fetchDashboardStats() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  const monthlyGrowth = stats?.monthlyGrowth || 0;
  const isGrowthPositive = monthlyGrowth >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="İşletmenizin güncel durumu ve performans metrikleri"
        actions={
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/orders/new">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Sipariş
            </Link>
          </Button>
        }
      />

      {/* Main Stats Grid - Enhanced */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  {monthlyGrowth !== 0 && (
                    <Badge variant={isGrowthPositive ? "default" : "destructive"} className="text-xs">
                      {isGrowthPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(monthlyGrowth).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Aylık Satış</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.monthlySales || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.monthlyOrderCount || 0} sipariş
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Bugünkü Satış</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.todaySales || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.todayOrderCount || 0} sipariş
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Müşteri</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.customerCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aktif müşteriler
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <Package className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Ürün</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.productCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stokta ürünler
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ortalama Sipariş</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(stats?.avgOrderValue || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aylık Kar</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(stats?.profit || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ödenmemiş</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(stats?.unpaidAmount || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Düşük Stok</p>
                    <p className="text-lg font-semibold">
                      {stats?.lowStockProducts?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts and Detailed Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart - Simple Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Son 7 Günlük Satış Trendi
            </CardTitle>
            <CardDescription>Günlük satış performansı</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : stats?.salesChartData?.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between h-64 gap-2">
                  {stats.salesChartData.map((day: any, index: number) => {
                    const maxSales = Math.max(...stats.salesChartData.map((d: any) => d.sales));
                    const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full h-full flex items-end">
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer group"
                            style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                            title={`${format(new Date(day.date), "dd MMM", { locale: tr })}: ${formatCurrency(day.sales)}`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {formatCurrency(day.sales)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(day.date), "dd MMM", { locale: tr })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Henüz satış verisi yok
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base hover:bg-blue-50 hover:border-blue-300 transition-all">
              <Link href="/orders/new">
                <Plus className="mr-3 h-5 w-5" />
                Yeni Sipariş
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Link href="/customers/new">
                <Users className="mr-3 h-5 w-5" />
                Yeni Müşteri
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base hover:bg-orange-50 hover:border-orange-300 transition-all">
              <Link href="/products/new">
                <Package className="mr-3 h-5 w-5" />
                Yeni Ürün
              </Link>
            </Button>
            <Separator className="my-3" />
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base hover:bg-green-50 hover:border-green-300 transition-all">
              <Link href="/reports">
                <BarChart3 className="mr-3 h-5 w-5" />
                Raporlar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                En Çok Satan Ürünler
              </CardTitle>
              <CardDescription>Bu ay en çok satan ürünler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/products">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.topProducts?.length > 0 ? (
              <div className="space-y-2">
                {stats.topProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} adet satıldı
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Henüz ürün satışı yok
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                En Çok Harcayan Müşteriler
              </CardTitle>
              <CardDescription>Bu ay en çok harcama yapan müşteriler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/customers">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.topCustomers?.length > 0 ? (
              <div className="space-y-2">
                {stats.topCustomers.map((customer: any, index: number) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.orderCount} sipariş
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Henüz müşteri verisi yok
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Products */}
        {stats?.lowStockProducts?.length > 0 && (
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Düşük Stok Uyarısı
              </CardTitle>
              <CardDescription>Stok seviyesi düşük olan ürünler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.lowStockProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}/edit`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-red-200 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stok: {product.stockQuantity} adet
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      Düşük
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Son Siparişler
              </CardTitle>
              <CardDescription>En son oluşturulan siparişler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.recentOrders?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.name} • {format(new Date(order.orderDate), "dd MMM yyyy, HH:mm", { locale: tr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {paymentTypeLabels[order.paymentType]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Henüz sipariş bulunmuyor
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      {stats?.recentCustomers?.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Yeni Müşteriler
              </CardTitle>
              <CardDescription>Son eklenen müşteriler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/customers">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentCustomers.map((customer: any) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
