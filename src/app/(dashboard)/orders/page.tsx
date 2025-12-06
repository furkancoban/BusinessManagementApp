"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, MoreHorizontal, Eye, Printer, Trash2, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  formatCurrency,
  formatDateTime,
  paymentTypeLabels,
  paymentTypeColors,
  orderStatusLabels,
  orderStatusColors,
} from "@/lib/utils";
import { exportToCSV, formatDateTimeForExport } from "@/lib/export";

async function fetchOrders(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`/api/orders?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function fetchCustomers() {
  const res = await fetch("/api/customers?limit=1000");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function deleteOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete order");
  return res.json();
}

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const queryParams: Record<string, string> = {};
  if (status && status !== "all") queryParams.status = status;
  if (customerId) queryParams.customerId = customerId;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const { data: customersData } = useQuery({
    queryKey: ["customers-filter"],
    queryFn: fetchCustomers,
  });

  const customers = customersData?.customers || [];

  const { data, isLoading } = useQuery({
    queryKey: ["orders", queryParams],
    queryFn: () => fetchOrders(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Başarılı",
        description: "Sipariş silindi.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sipariş silinirken bir hata oluştu.",
      });
    },
  });

  const orders = data?.orders || [];
  const totalAmount = orders.reduce(
    (sum: number, order: any) => sum + order.totalAmount,
    0
  );

  const handleExport = () => {
    if (!orders.length) return;
    
    const exportData = orders.map((order: any) => ({
      "Sipariş No": order.orderNumber,
      "Müşteri": order.customer.name,
      "Tarih": formatDateTimeForExport(order.orderDate),
      "Toplam": formatCurrency(order.totalAmount),
      "Ödeme Tipi": paymentTypeLabels[order.paymentType] || order.paymentType,
      "Durum": orderStatusLabels[order.status] || order.status,
      "Notlar": order.notes || "-",
    }));
    
    exportToCSV(exportData, `siparisler-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siparişler"
        description="Tüm siparişler ve satış geçmişi"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isLoading || !orders.length}
              className="hidden sm:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
            <Button asChild size="default" className="w-full sm:w-auto text-sm sm:text-base">
              <Link href="/orders/new">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Yeni Sipariş</span>
                <span className="sm:hidden">Yeni</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Müşteri</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm müşteriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm müşteriler</SelectItem>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            {(startDate || endDate || status !== "all" || customerId) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus("all");
                    setCustomerId("");
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

      {/* Summary */}
      {orders.length > 0 && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{orders.length} sipariş</span>
          <span>•</span>
          <span>Toplam: {formatCurrency(totalAmount)}</span>
        </div>
      )}

      {/* Order List */}
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
          icon={ShoppingCart}
          title="Sipariş bulunamadı"
          description="Filtrelere uygun sipariş bulunamadı veya henüz sipariş oluşturulmamış."
          actionLabel="Yeni Sipariş Oluştur"
          actionHref="/orders/new"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-lg font-semibold text-foreground hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                      <Badge
                        className={orderStatusColors[order.status]}
                        variant="secondary"
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={paymentTypeColors[order.paymentType] || ""}
                      >
                        {paymentTypeLabels[order.paymentType]}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>{formatDateTime(order.orderDate)}</span>
                      <span>•</span>
                      <Link
                        href={`/customers/${order.customer.id}`}
                        className="hover:text-foreground"
                      >
                        {order.customer.name}
                      </Link>
                      {order.customer.phone && (
                        <>
                          <span>•</span>
                          <span>{order.customer.phone}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
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

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Menü</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detay & Fiş
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Siparişi Sil"
        description="Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

