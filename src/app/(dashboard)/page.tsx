"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, paymentTypeLabels } from "@/lib/utils";

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Genel Bakış"
        description="İşletmenizin güncel durumu"
        actions={
          <Button asChild size="lg">
            <Link href="/orders/new">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Sipariş
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Bugünkü Satış"
              value={formatCurrency(stats?.todaySales || 0)}
              icon={TrendingUp}
              description={`${stats?.todayOrderCount || 0} sipariş`}
            />
            <StatCard
              title="Aylık Satış"
              value={formatCurrency(stats?.monthlySales || 0)}
              icon={ShoppingCart}
              description={`${stats?.monthlyOrderCount || 0} sipariş`}
            />
            <StatCard
              title="Toplam Müşteri"
              value={stats?.customerCount || 0}
              icon={Users}
            />
            <StatCard
              title="Toplam Ürün"
              value={stats?.productCount || 0}
              icon={Package}
            />
          </>
        )}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start h-14 text-base">
              <Link href="/orders/new">
                <Plus className="mr-3 h-5 w-5" />
                Yeni Sipariş Oluştur
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-14 text-base">
              <Link href="/customers/new">
                <Users className="mr-3 h-5 w-5" />
                Yeni Müşteri Ekle
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-14 text-base">
              <Link href="/products/new">
                <Package className="mr-3 h-5 w-5" />
                Yeni Ürün Ekle
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Son Siparişler</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name} • {formatDateTime(order.orderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <Badge variant="secondary" className="mt-1">
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
    </div>
  );
}

