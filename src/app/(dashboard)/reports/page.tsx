"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Crown,
  Receipt,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

async function fetchReports(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className = "",
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  isCurrency = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  subtitle?: string;
  trend?: "up" | "down";
  className?: string;
  iconBg?: string;
  iconColor?: string;
  isCurrency?: boolean;
}) {
  // Extract numeric value if it's a currency string
  const numericValue = typeof value === "string" && value.includes("₺")
    ? parseFloat(value.replace(/[₺.,]/g, "").replace(",", "."))
    : typeof value === "number" ? value : 0;

  const getTextSize = (val: number) => {
    if (val >= 10000000) return "text-[10px] sm:text-xs";
    if (val >= 1000000) return "text-xs sm:text-sm";
    if (val >= 100000) return "text-sm sm:text-base";
    if (val >= 10000) return "text-base sm:text-lg";
    return "text-lg sm:text-xl";
  };

  return (
    <Card className={`relative overflow-hidden h-full ${className}`}>
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 transform translate-x-5 -translate-y-5 sm:translate-x-6 sm:-translate-y-6">
        <div className={`w-full h-full rounded-full ${iconBg} opacity-20`} />
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className={`font-bold mt-1 whitespace-nowrap leading-tight ${
              isCurrency ? getTextSize(numericValue) : "text-base sm:text-lg"
            }`}>
              {value}
            </p>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-1 truncate">{subtitle}</p>}
          </div>
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${iconBg} shrink-0`}>
            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reports", startDate, endDate],
    queryFn: () => fetchReports(startDate, endDate),
  });

  if (isLoading) return <Loading />;

  const profitMargin = data?.totalSales > 0 ? ((data.totalProfit / data.totalSales) * 100).toFixed(1) : 0;

  // Prepare pie chart data for product categories
  const categoryData =
    data?.stockReport?.reduce((acc: any[], product: any) => {
      const existing = acc.find((item) => item.name === (product.category || "Kategorisiz"));
      if (existing) {
        existing.value += product.stockQuantity;
      } else {
        acc.push({ name: product.category || "Kategorisiz", value: product.stockQuantity });
      }
      return acc;
    }, []) || [];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Raporlar"
        description="İşletmenizin detaylı performans analizi"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Label className="text-[10px] sm:text-xs whitespace-nowrap shrink-0">Başlangıç:</Label>
              <DatePicker
                value={startDate}
                onChange={(value) => setStartDate(value)}
                placeholder="Başlangıç tarihi"
                className="w-full sm:w-36 h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <Label className="text-[10px] sm:text-xs whitespace-nowrap shrink-0">Bitiş:</Label>
              <DatePicker
                value={endDate}
                onChange={(value) => setEndDate(value)}
                placeholder="Bitiş tarihi"
                className="w-full sm:w-36 h-8 text-xs"
              />
            </div>
            <Button onClick={() => refetch()} size="sm" className="h-8 text-xs">Filtrele</Button>
          </div>
        }
      />

      {/* Main Stats */}
      <div className={`grid gap-2 sm:gap-3 ${data?.veresiyeOrderCount > 0 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"}`}>
        <StatCard
          title="Toplam Satış"
          value={formatCurrency(data?.totalSales || 0)}
          icon={DollarSign}
          subtitle={`${data?.orderCount || 0} sipariş`}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          isCurrency={true}
        />
        <StatCard
          title="Toplam Kar"
          value={formatCurrency(data?.totalProfit || 0)}
          icon={TrendingUp}
          subtitle={`%${profitMargin} kar marjı`}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          isCurrency={true}
        />
        <StatCard
          title="Sipariş Sayısı"
          value={data?.orderCount || 0}
          icon={ShoppingCart}
          subtitle={`Ort. ${formatCurrency(data?.averageOrderValue || 0)}`}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Stok Değeri"
          value={formatCurrency(data?.totalStockValue || 0)}
          icon={Package}
          subtitle={`${data?.stockReport?.length || 0} ürün`}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          isCurrency={true}
        />
        {data?.veresiyeOrderCount > 0 && (
          <StatCard
            title="Veresiye Borç"
            value={formatCurrency(data?.veresiyeTotalAmount || 0)}
            icon={Receipt}
            subtitle={`${data?.veresiyeOrderCount || 0} sipariş`}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            isCurrency={true}
          />
        )}
      </div>

      {/* Veresiye Orders Section */}
      {data?.veresiyeOrderCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Veresiye Siparişler</h2>
              <p className="text-sm text-muted-foreground mt-1">Ödenmemiş veresiye siparişlerin detaylı raporu</p>
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-2 border-orange-300">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-orange-100">Toplam Veresiye</p>
                    <p className={`font-bold mt-2 whitespace-nowrap leading-tight ${
                      (data?.veresiyeTotalAmount || 0) >= 1000000
                        ? "text-base sm:text-lg lg:text-xl"
                        : (data?.veresiyeTotalAmount || 0) >= 100000
                        ? "text-lg sm:text-xl lg:text-2xl"
                        : (data?.veresiyeTotalAmount || 0) >= 10000
                        ? "text-xl sm:text-2xl lg:text-3xl"
                        : "text-2xl sm:text-3xl lg:text-4xl"
                    }`}>
                      {formatCurrency(data?.veresiyeTotalAmount || 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-orange-100 mt-2">{data?.veresiyeOrderCount || 0} sipariş</p>
                  </div>
                  <Receipt className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white h-full">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-amber-100">Ortalama Veresiye</p>
                    <p className={`font-bold mt-2 whitespace-nowrap leading-tight ${
                      ((data?.veresiyeTotalAmount || 0) / (data?.veresiyeOrderCount || 1)) >= 100000
                        ? "text-base sm:text-lg lg:text-xl"
                        : ((data?.veresiyeTotalAmount || 0) / (data?.veresiyeOrderCount || 1)) >= 10000
                        ? "text-lg sm:text-xl lg:text-2xl"
                        : "text-xl sm:text-2xl lg:text-3xl"
                    }`}>
                      {formatCurrency((data?.veresiyeTotalAmount || 0) / (data?.veresiyeOrderCount || 1))}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-100 mt-2">sipariş başına</p>
                  </div>
                  <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white h-full">
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-red-100">Müşteri Sayısı</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 whitespace-nowrap">{data?.veresiyeByCustomer?.length || 0}</p>
                    <p className="text-xs sm:text-sm text-red-100 mt-2">veresiye müşteri</p>
                  </div>
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Veresiye by Customer Table */}
          {data?.veresiyeByCustomer && data.veresiyeByCustomer.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
                  <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 shrink-0" />
                  Müşterilere Göre Veresiye Detayları
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">Her müşterinin toplam veresiye borcu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Müşteri</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Sipariş Sayısı</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm min-w-[120px]">Toplam Borç</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm hidden md:table-cell">İlk Sipariş Tarihi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.veresiyeByCustomer.map((customer: any) => (
                          <tr key={customer.customerId} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">
                              <Link href={`/customers/${customer.customerId}`} className="hover:text-primary hover:underline">
                                {customer.customerName}
                              </Link>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm">{customer.orderCount}</td>
                            <td className="py-3 px-3 sm:px-4 text-right font-bold text-xs sm:text-sm text-orange-600 whitespace-nowrap min-w-[120px]">
                              {formatCurrency(customer.totalAmount)}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm hidden md:table-cell text-muted-foreground">
                              {customer.oldestOrderDate ? formatDate(customer.oldestOrderDate) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-muted/50 font-bold">
                          <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">TOPLAM</td>
                          <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">{data.veresiyeOrderCount}</td>
                          <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-orange-600 whitespace-nowrap min-w-[120px]">
                            {formatCurrency(data.veresiyeTotalAmount)}
                          </td>
                          <td className="py-3 px-3 sm:px-4 hidden md:table-cell"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stock Alerts */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-emerald-100">Stokta</p>
                <p className="text-lg sm:text-xl font-bold mt-1 whitespace-nowrap">
                  {(data?.stockReport?.length || 0) - (data?.lowStockCount || 0) - (data?.outOfStockCount || 0)}
                </p>
                <p className="text-[10px] text-emerald-100 mt-1">ürün yeterli stokta</p>
              </div>
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-100">Düşük Stok</p>
                <p className="text-lg sm:text-xl font-bold mt-1 whitespace-nowrap">{data?.lowStockCount || 0}</p>
                <p className="text-[10px] text-amber-100 mt-1">ürün 10 adet altında</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white h-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-red-100">Stokta Yok</p>
                <p className="text-lg sm:text-xl font-bold mt-1 whitespace-nowrap">{data?.outOfStockCount || 0}</p>
                <p className="text-[10px] text-red-100 mt-1">ürün tükendi</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-red-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Veresiye Chart */}
      {data?.veresiyeByCustomer && data.veresiyeByCustomer.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 shrink-0" />
              Veresiye Dağılımı
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Müşterilere göre veresiye borç dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-48 lg:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.veresiyeByCustomer.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                  <YAxis
                    dataKey="customerName"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => (value.length > 15 ? value.substring(0, 15) + "..." : value)}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Borç"]}
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]} fill="#f97316">
                    {data.veresiyeByCustomer.slice(0, 10).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 lg:grid-cols-2">
        {/* Top Products Bar Chart */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
              En Çok Satan Ürünler
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Gelire göre sıralanmış</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topProducts?.length ? (
              <div className="h-40 sm:h-48 lg:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                    <YAxis dataKey="productName" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Gelir"]}
                      contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                    />
                    <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]}>
                      {data.topProducts.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 sm:h-48 lg:h-56 flex items-center justify-center text-muted-foreground text-xs">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers Pie Chart */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
              En İyi Müşteriler
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Harcamaya göre dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.topCustomers?.length ? (
              <div className="h-40 sm:h-48 lg:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.topCustomers}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="totalSpent"
                      nameKey="customerName"
                      label={({ name, percent }) => {
                        const shortName = name.split(" ")[0];
                        return `${shortName} (${(percent * 100).toFixed(0)}%)`;
                      }}
                      labelLine={false}
                    >
                      {data.topCustomers.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      formatter={(value) => {
                        const shortName = value.split(" ")[0];
                        return shortName.length > 10 ? shortName.substring(0, 10) + "..." : shortName;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 sm:h-48 lg:h-56 flex items-center justify-center text-muted-foreground text-xs">
                Veri yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
              <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
              Kategori Bazlı Stok Dağılımı
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Kategorilere göre stok miktarları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-48 lg:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Report Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm sm:text-base">
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
            Stok Raporu
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">Tüm ürünlerin stok durumu</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.stockReport?.length ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Ürün</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm hidden sm:table-cell">SKU</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm hidden md:table-cell">Kategori</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Stok</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm hidden lg:table-cell min-w-[110px]">Birim Fiyat</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm min-w-[130px]">Değer</th>
                      <th className="text-center py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stockReport.map((product: any) => (
                      <tr key={product.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">{product.name}</td>
                        <td className="py-3 px-3 sm:px-4 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{product.sku || "-"}</td>
                        <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                          {product.category && <Badge variant="secondary" className="text-xs">{product.category}</Badge>}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm">{product.stockQuantity}</td>
                        <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap min-w-[110px]">{formatCurrency(product.sellPrice)}</td>
                        <td className="py-3 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm whitespace-nowrap min-w-[130px]">{formatCurrency(product.stockQuantity * product.purchasePrice)}</td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          {product.stockQuantity === 0 ? (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <AlertCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">Tükendi</span>
                            </Badge>
                          ) : product.stockQuantity < 10 ? (
                            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="hidden sm:inline">Düşük</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                              Yeterli
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
              <p className="text-sm sm:text-base">Henüz ürün yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
