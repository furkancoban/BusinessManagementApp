"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CheckCircle2, Eye, Phone, Mail, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDateTime, paymentTypeColors } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

async function fetchUnpaidOrders(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`/api/orders?paymentType=VERESIYE&status=COMPLETED&${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch unpaid orders");
  return res.json();
}


export default function UnpaidOrdersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const queryClient = useQueryClient();

  const queryParams: Record<string, string> = {};
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const { data, isLoading } = useQuery({
    queryKey: ["unpaid-orders", queryParams],
    queryFn: () => fetchUnpaidOrders(queryParams),
  });


  const orders = data?.orders || [];
  const totalUnpaid = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veresiye Siparişler"
        description="Ödenmemiş veresiye siparişleri yönetimi"
      />

      {/* Summary Card */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Toplam Ödenmemiş Tutar</p>
              <p className="text-3xl font-bold text-orange-700">
                {formatCurrency(totalUnpaid)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orders.length} adet veresiye sipariş
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <CreditCard className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Başlangıç Tarihi</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Başlangıç tarihi seçin"
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Bitiş Tarihi</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Bitiş tarihi seçin"
              />
            </div>
            {(startDate || endDate) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Veresiye sipariş bulunamadı"
          description="Tüm siparişler ödendi veya henüz veresiye sipariş oluşturulmamış."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-2 border-orange-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-lg font-semibold text-foreground hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                      <Badge className={paymentTypeColors[order.paymentType] || ""}>
                        Veresiye
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.orderDate), "dd MMM yyyy", { locale: tr })}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Müşteri:</span>
                        <Link
                          href={`/customers/${order.customer.id}`}
                          className="text-primary hover:underline font-semibold"
                        >
                          {order.customer.name}
                        </Link>
                      </div>
                      {order.customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{order.customer.phone}</span>
                        </div>
                      )}
                      {order.customer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{order.customer.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <span key={item.id}>
                          {item.product.name} x{item.quantity}
                          {index < Math.min(order.items.length, 3) - 1 && ", "}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span> +{order.items.length - 3} ürün daha</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-700">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ödenmemiş
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detay
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

