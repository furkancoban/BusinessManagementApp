"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Warehouse,
  AlertTriangle,
  PackageX,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

async function fetchReports(startDate: string, endDate: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export default function ReportsPage() {
  // Default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0]);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", startDate, endDate],
    queryFn: () => fetchReports(startDate, endDate),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlar"
        description="Satış ve performans raporları"
      />

      {/* Date Range Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  const today = new Date();
                  setStartDate(today.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
              >
                Bugün
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setStartDate(weekAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
              >
                Son 7 Gün
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setStartDate(firstDay.toISOString().split("T")[0]);
                  setEndDate(lastDay.toISOString().split("T")[0]);
                }}
              >
                Bu Ay
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Satış"
            value={formatCurrency(data?.totalSales || 0)}
            icon={DollarSign}
            description={`${data?.orderCount || 0} sipariş`}
          />
          <StatCard
            title="Toplam Kar"
            value={formatCurrency(data?.totalProfit || 0)}
            icon={TrendingUp}
            description={`%${((data?.totalProfit / data?.totalSales) * 100 || 0).toFixed(1)} kar marjı`}
          />
          <StatCard
            title="Ortalama Sipariş"
            value={formatCurrency(data?.averageOrderValue || 0)}
            icon={BarChart3}
          />
          <StatCard
            title="Yeni Müşteri"
            value={data?.newCustomerCount || 0}
            icon={Users}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              En Çok Satan Ürünler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.map((product: any, index: number) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.totalQuantity} adet satıldı
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Bu dönemde satış bulunamadı
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              En İyi Müşteriler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.topCustomers?.length > 0 ? (
              <div className="space-y-3">
                {data.topCustomers.map((customer: any, index: number) => (
                  <div
                    key={customer.customerId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{customer.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orderCount} sipariş
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Bu dönemde sipariş bulunamadı
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Report Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Warehouse className="h-6 w-6" />
          Stok Raporu
        </h2>

        {/* Stock Stats */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Toplam Stok Değeri"
              value={formatCurrency(data?.totalStockValue || 0)}
              icon={Warehouse}
              description={`${data?.stockReport?.length || 0} ürün`}
            />
            <StatCard
              title="Düşük Stok"
              value={data?.lowStockCount || 0}
              icon={AlertTriangle}
              description="10 adetten az"
              className={data?.lowStockCount > 0 ? "border-yellow-500" : ""}
            />
            <StatCard
              title="Stokta Yok"
              value={data?.outOfStockCount || 0}
              icon={PackageX}
              description="Tükenen ürünler"
              className={data?.outOfStockCount > 0 ? "border-red-500" : ""}
            />
          </div>
        )}

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ürün Stok Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : data?.stockReport?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Ürün</th>
                      <th className="pb-3 font-semibold hidden sm:table-cell">SKU</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Kategori</th>
                      <th className="pb-3 font-semibold text-center">Stok</th>
                      <th className="pb-3 font-semibold text-right hidden sm:table-cell">Alış Fiyatı</th>
                      <th className="pb-3 font-semibold text-right">Stok Değeri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stockReport.map((product: any) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="py-3">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {product.sku || "-"}
                          </p>
                        </td>
                        <td className="py-3 hidden sm:table-cell text-muted-foreground">
                          {product.sku || "-"}
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          {product.category ? (
                            <Badge variant="secondary">{product.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Badge
                            variant={
                              product.stockQuantity === 0
                                ? "destructive"
                                : product.stockQuantity < 10
                                ? "warning"
                                : "success"
                            }
                            className="min-w-[60px]"
                          >
                            {product.stockQuantity} adet
                          </Badge>
                        </td>
                        <td className="py-3 text-right hidden sm:table-cell">
                          {formatCurrency(product.purchasePrice)}
                        </td>
                        <td className="py-3 text-right font-semibold">
                          {formatCurrency(product.stockQuantity * product.purchasePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="pt-3" colSpan={3}>Toplam</td>
                      <td className="pt-3 text-center">
                        {data.stockReport.reduce((sum: number, p: any) => sum + p.stockQuantity, 0)} adet
                      </td>
                      <td className="pt-3 hidden sm:table-cell"></td>
                      <td className="pt-3 text-right">
                        {formatCurrency(data.totalStockValue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Ürün bulunamadı
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

