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
  Settings,
  List,
  FileText,
  Store,
  Calendar,
  Heart,
  Target,
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

async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60000, // Refetch every minute
  });

  const monthlyGrowth = stats?.monthlyGrowth || 0;
  const isGrowthPositive = monthlyGrowth >= 0;
  
  const notifications = notificationsData?.notifications || {};
  const allNotifications = [
    ...(notifications.lowStock || []),
    ...(notifications.outOfStock || []),
    ...(notifications.todayOrders || []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="İşletmenizin güncel durumu ve performans metrikleri"
        actions={
          <Button asChild size="default" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base">
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Yeni Sipariş</span>
              <span className="sm:hidden">Yeni</span>
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

      {/* Quick Actions - Repositioned to top */}
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            Hızlı İşlemler
          </CardTitle>
          <CardDescription>En sık kullanılan işlemlere hızlı erişim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            {/* Create Actions */}
            <Link
              href="/orders/new"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-blue-900">Yeni Sipariş</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/customers/new"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-purple-900">Yeni Müşteri</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/products/new"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-orange-900">Yeni Ürün</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* View Actions */}
            <Link
              href="/orders"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:border-indigo-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <List className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-indigo-900">Tüm Siparişler</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/orders/unpaid"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:border-amber-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-amber-900">Veresiye Siparişler</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/customers"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 hover:border-cyan-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-cyan-900">Müşteriler</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/products"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:border-emerald-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-emerald-900">Ürünler</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Reports & Settings */}
            <Link
              href="/reports"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-green-900">Raporlar</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/settings"
              className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 hover:border-slate-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                <Settings className="h-6 w-6" />
              </div>
              <span className="font-semibold text-sm text-center text-slate-900">Ayarlar</span>
              <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Detailed Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart - Enhanced Bar Chart */}
        <Card className="lg:col-span-2 border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  Son 7 Günlük Satış Trendi
                </CardTitle>
                <CardDescription className="mt-1">Günlük satış performansı ve trend analizi</CardDescription>
              </div>
              {stats?.salesChartData && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Toplam</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(
                      stats.salesChartData.reduce((sum: number, day: any) => sum + (day.sales || 0), 0)
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : stats?.salesChartData?.length > 0 ? (
              <div className="space-y-6">
                {/* Chart with grid lines */}
                <div className="relative h-80 pb-8">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <div
                        key={percent}
                        className="border-t border-dashed border-gray-200"
                        style={{ marginTop: percent === 0 ? 0 : `${percent}%` }}
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="relative h-full flex items-end justify-between gap-3 px-2">
                    {stats.salesChartData.map((day: any, index: number) => {
                      const maxSales = Math.max(...stats.salesChartData.map((d: any) => d.sales || 0), 1);
                      const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                      const dateStr = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0];
                      const isToday = format(new Date(dateStr), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      const isHighest = day.sales === maxSales;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-3 h-full min-w-0 group">
                          {/* Value label on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            {formatCurrency(day.sales || 0)}
                          </div>

                          {/* Bar container */}
                          <div className="relative w-full h-full flex items-end justify-center">
                            <div
                              className={`w-full rounded-t-xl transition-all duration-500 cursor-pointer relative overflow-hidden ${
                                isHighest
                                  ? "bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 shadow-lg shadow-emerald-200 ring-2 ring-emerald-300"
                                  : isToday
                                  ? "bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 shadow-md shadow-blue-200"
                                  : "bg-gradient-to-t from-indigo-500 via-indigo-400 to-indigo-300 shadow-sm shadow-indigo-100"
                              } group-hover:scale-105 group-hover:shadow-xl`}
                              style={{ 
                                height: `${Math.max(height, 3)}%`,
                                minHeight: height > 0 ? "12px" : "0",
                                animationDelay: `${index * 100}ms`
                              }}
                              title={`${format(new Date(dateStr), "dd MMM yyyy", { locale: tr })}: ${formatCurrency(day.sales || 0)}`}
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                              
                              {/* Value inside bar if enough space */}
                              {height > 15 && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                  {formatCurrency(day.sales || 0)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date label */}
                          <div className="text-center min-h-[40px] flex flex-col items-center justify-center">
                            <p className={`text-xs font-medium ${
                              isToday ? "text-blue-600 font-bold" : "text-muted-foreground"
                            }`}>
                              {format(new Date(dateStr), "dd MMM", { locale: tr })}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {format(new Date(dateStr), "EEE", { locale: tr })}
                            </p>
                            {isHighest && (
                              <span className="mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                                En Yüksek
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Ortalama Günlük</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(
                        stats.salesChartData.reduce((sum: number, day: any) => sum + (day.sales || 0), 0) / stats.salesChartData.length
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">En Yüksek Gün</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatCurrency(
                        Math.max(...stats.salesChartData.map((d: any) => d.sales || 0))
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">En Düşük Gün</p>
                    <p className="text-lg font-bold text-orange-700">
                      {formatCurrency(
                        Math.min(...stats.salesChartData.map((d: any) => d.sales || 0))
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center py-8">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Henüz satış verisi yok</p>
                <p className="text-sm text-muted-foreground mt-1">İlk siparişinizi oluşturduğunuzda grafik burada görünecek</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Widget */}
        {allNotifications.length > 0 && (
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                Bildirimler
                {notificationsData?.totalCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notificationsData.totalCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">Önemli uyarılar ve bildirimler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allNotifications.slice(0, 5).map((notification: any) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.type === "low_stock" || notification.type === "out_of_stock"
                        ? `/products/${notification.productId}/edit`
                        : "/orders"
                    }
                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-amber-200 hover:shadow-md transition-all"
                  >
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
                      <p className="font-semibold text-sm sm:text-base">{notification.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    </div>
                  </Link>
                ))}
                {allNotifications.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{allNotifications.length - 5} bildirim daha
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Feature Cards: Today's Summary, Weekly Performance, Business Health */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bugünün Özeti */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                <Calendar className="h-5 w-5" />
              </div>
              Bugünün Özeti
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Bugünkü işlerin detaylı özeti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-700">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bugünkü Siparişler</p>
                      <p className="font-bold text-base sm:text-lg">{stats?.todayOrderCount || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Gelir</p>
                    <p className="font-bold text-base sm:text-lg text-green-700">
                      {formatCurrency(stats?.todaySales || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Yeni Müşteriler</p>
                      <p className="font-bold text-base sm:text-lg">
                        {stats?.recentCustomers?.filter((c: any) => {
                          const customerDate = new Date(c.createdAt);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return customerDate >= today;
                        }).length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Toplam</p>
                    <p className="font-bold text-base sm:text-lg text-blue-700">
                      {stats?.customerCount || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ortalama Sipariş</p>
                      <p className="font-bold text-base sm:text-lg">
                        {formatCurrency(stats?.avgOrderValue || 0)}
                      </p>
                    </div>
                  </div>
                  {stats?.todayOrderCount > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Haftalık Performans */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <BarChart3 className="h-5 w-5" />
              </div>
              Haftalık Performans
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Son 7 günün performans analizi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Haftalık Toplam</p>
                      <p className="font-bold text-base sm:text-lg text-blue-700">
                        {formatCurrency(
                          stats?.salesChartData?.reduce((sum: number, day: any) => sum + (day.sales || 0), 0) || 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">En Yüksek Gün</p>
                      <p className="font-bold text-base sm:text-lg text-emerald-700">
                        {formatCurrency(
                          stats?.salesChartData?.length > 0
                            ? Math.max(...stats.salesChartData.map((d: any) => d.sales || 0))
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ortalama Günlük</p>
                      <p className="font-bold text-base sm:text-lg text-orange-700">
                        {formatCurrency(
                          stats?.salesChartData?.length > 0
                            ? stats.salesChartData.reduce((sum: number, day: any) => sum + (day.sales || 0), 0) /
                              stats.salesChartData.length
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* İşletme Sağlığı Skoru */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
                <Heart className="h-5 w-5" />
              </div>
              İşletme Sağlığı
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Genel durum ve performans skoru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Health Score */}
                <div className="relative">
                  <div className="flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 mx-auto w-32 h-32 sm:w-40 sm:h-40">
                    <div className="text-center">
                      {(() => {
                        let score = 100;
                        // Deduct points for low stock
                        const lowStockCount = stats?.lowStockProducts?.length || 0;
                        score -= Math.min(lowStockCount * 5, 30);
                        // Deduct points for unpaid veresiye
                        const unpaidAmount = stats?.unpaidAmount || 0;
                        const monthlySales = stats?.monthlySales || 1;
                        if (unpaidAmount > monthlySales * 0.3) score -= 20;
                        else if (unpaidAmount > monthlySales * 0.15) score -= 10;
                        // Bonus for growth
                        if (monthlyGrowth > 0) score += Math.min(monthlyGrowth, 10);
                        score = Math.max(0, Math.min(100, score));
                        return (
                          <>
                            <p className="text-3xl sm:text-4xl font-bold text-purple-700">{Math.round(score)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Puan</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge
                      variant={(() => {
                        let score = 100;
                        const lowStockCount = stats?.lowStockProducts?.length || 0;
                        score -= Math.min(lowStockCount * 5, 30);
                        const unpaidAmount = stats?.unpaidAmount || 0;
                        const monthlySales = stats?.monthlySales || 1;
                        if (unpaidAmount > monthlySales * 0.3) score -= 20;
                        else if (unpaidAmount > monthlySales * 0.15) score -= 10;
                        if (monthlyGrowth > 0) score += Math.min(monthlyGrowth, 10);
                        score = Math.max(0, Math.min(100, score));
                        return score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive";
                      })()}
                      className="text-xs sm:text-sm"
                    >
                      {(() => {
                        let score = 100;
                        const lowStockCount = stats?.lowStockProducts?.length || 0;
                        score -= Math.min(lowStockCount * 5, 30);
                        const unpaidAmount = stats?.unpaidAmount || 0;
                        const monthlySales = stats?.monthlySales || 1;
                        if (unpaidAmount > monthlySales * 0.3) score -= 20;
                        else if (unpaidAmount > monthlySales * 0.15) score -= 10;
                        if (monthlyGrowth > 0) score += Math.min(monthlyGrowth, 10);
                        score = Math.max(0, Math.min(100, score));
                        return score >= 80 ? "Mükemmel" : score >= 60 ? "İyi" : "Geliştirilebilir";
                      })()}
                    </Badge>
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aylık Büyüme</span>
                    <div className="flex items-center gap-1">
                      {monthlyGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-semibold ${monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {Math.abs(monthlyGrowth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Düşük Stok</span>
                    <span className={`font-semibold ${(stats?.lowStockProducts?.length || 0) > 0 ? "text-orange-600" : "text-green-600"}`}>
                      {stats?.lowStockProducts?.length || 0} ürün
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ödenmemiş Borç</span>
                    <span className={`font-semibold ${(stats?.unpaidAmount || 0) > (stats?.monthlySales || 1) * 0.15 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(stats?.unpaidAmount || 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Star className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500" />
                En Çok Satan Ürünler
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">Bu ay en çok satan ürünler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
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
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
                    <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                  </div>
                ))}
              </div>
            ) : stats?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-base sm:text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg truncate">{product.name}</p>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                          {product.quantity} adet satıldı
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-base sm:text-lg text-orange-700">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-base sm:text-lg text-muted-foreground">
                Henüz ürün satışı yok
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                En Çok Harcayan Müşteriler
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">Bu ay en çok harcama yapan müşteriler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
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
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
                    <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                  </div>
                ))}
              </div>
            ) : stats?.topCustomers?.length > 0 ? (
              <div className="space-y-3">
                {stats.topCustomers.map((customer: any, index: number) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold text-base sm:text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base sm:text-lg truncate">{customer.name}</p>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                          {customer.orderCount} sipariş
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-base sm:text-lg text-purple-700">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-base sm:text-lg text-muted-foreground">
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
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-red-700 text-lg sm:text-xl">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
                Düşük Stok Uyarısı
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">Stok seviyesi düşük olan ürünler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.lowStockProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}/edit`}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border-2 border-red-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base sm:text-lg truncate">{product.name}</p>
                      <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                        Stok: {product.stockQuantity} adet
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-3 text-sm sm:text-base px-3 py-1 flex-shrink-0">
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
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
                Son Siparişler
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">En son oluşturulan siparişler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
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
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
                    <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                  </div>
                ))}
              </div>
            ) : stats?.recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base sm:text-lg truncate">{order.orderNumber}</p>
                      <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                        {order.customer.name} • {format(new Date(order.orderDate), "dd MMM yyyy, HH:mm", { locale: tr })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-base sm:text-lg text-blue-700">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant="secondary" className="mt-1 text-xs sm:text-sm">
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
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                Yeni Müşteriler
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">Son eklenen müşteriler</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/customers">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentCustomers.map((customer: any) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="p-4 sm:p-5 rounded-xl border-2 bg-card hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-lg sm:text-xl flex-shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base sm:text-lg truncate">{customer.name}</p>
                      {customer.email && (
                        <p className="text-sm sm:text-base text-muted-foreground truncate mt-0.5">{customer.email}</p>
                      )}
                      {customer.phone && (
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">{customer.phone}</p>
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
