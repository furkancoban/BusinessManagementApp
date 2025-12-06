"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CheckCircle2, Eye, Phone, Mail, Calendar, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDateTime, paymentTypeColors, paymentTypeLabels } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { exportToCSV, formatDateTimeForExport } from "@/lib/export";

async function fetchUnpaidOrders(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`/api/orders?paymentType=VERESIYE&status=COMPLETED&${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch unpaid orders");
  return res.json();
}

async function fetchCustomers() {
  const res = await fetch("/api/customers?limit=1000");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function markOrderAsPaid(orderId: string, paymentType: string) {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentType,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to mark order as paid");
  }
  return res.json();
}


export default function UnpaidOrdersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentType, setPaymentType] = useState<string>("CASH");
  const queryClient = useQueryClient();

  const queryParams: Record<string, string> = {};
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (customerId) queryParams.customerId = customerId;

  const { data: customersData } = useQuery({
    queryKey: ["customers-filter"],
    queryFn: fetchCustomers,
  });

  const customers = customersData?.customers || [];

  const { data, isLoading } = useQuery({
    queryKey: ["unpaid-orders", queryParams],
    queryFn: () => fetchUnpaidOrders(queryParams),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ orderId, paymentType }: { orderId: string; paymentType: string }) =>
      markOrderAsPaid(orderId, paymentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unpaid-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setShowMarkPaidDialog(false);
      setSelectedOrder(null);
      setPaymentType("CASH");
      toast({
        title: "Başarılı",
        description: "Sipariş ödendi olarak işaretlendi.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Sipariş ödendi olarak işaretlenirken bir hata oluştu.",
      });
    },
  });

  const handleMarkAsPaid = (order: any) => {
    setSelectedOrder(order);
    setShowMarkPaidDialog(true);
  };

  const handleConfirmMarkAsPaid = () => {
    if (!selectedOrder) return;
    markPaidMutation.mutate({
      orderId: selectedOrder.id,
      paymentType,
    });
  };

  const orders = data?.orders || [];
  const totalUnpaid = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

  const handleExport = () => {
    if (!orders.length) return;
    
    const exportData = orders.map((order: any) => ({
      "Sipariş No": order.orderNumber,
      "Müşteri": order.customer.name,
      "Telefon": order.customer.phone || "-",
      "E-posta": order.customer.email || "-",
      "Tarih": formatDateTimeForExport(order.orderDate),
      "Toplam": formatCurrency(order.totalAmount),
      "Durum": "Ödenmemiş",
    }));
    
    exportToCSV(exportData, `veresiye-siparisler-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veresiye Siparişler"
        description="Ödenmemiş veresiye siparişleri yönetimi"
        actions={
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || !orders.length}
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        }
      />

      {/* Summary Card */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Toplam Ödenmemiş Tutar</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-700">
                {formatCurrency(totalUnpaid)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {orders.length} adet veresiye sipariş
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex-shrink-0">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="space-y-2 flex-1 min-w-0 sm:min-w-[200px]">
              <Label className="text-sm">Müşteri</Label>
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
            <div className="space-y-2 flex-1 min-w-0 sm:min-w-[200px]">
              <Label className="text-sm">Başlangıç Tarihi</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Başlangıç tarihi seçin"
              />
            </div>
            <div className="space-y-2 flex-1 min-w-0 sm:min-w-[200px]">
              <Label className="text-sm">Bitiş Tarihi</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Bitiş tarihi seçin"
              />
            </div>
            {(startDate || endDate || customerId) && (
              <div className="flex items-end w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCustomerId("");
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-base sm:text-lg font-semibold text-foreground hover:text-primary break-all"
                      >
                        {order.orderNumber}
                      </Link>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={paymentTypeColors[order.paymentType] || ""}>
                          Veresiye
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {format(new Date(order.orderDate), "dd MMM yyyy", { locale: tr })}
                          </span>
                          <span className="sm:hidden">
                            {format(new Date(order.orderDate), "dd/MM/yy", { locale: tr })}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">Müşteri:</span>
                        <Link
                          href={`/customers/${order.customer.id}`}
                          className="text-primary hover:underline font-semibold break-all"
                        >
                          {order.customer.name}
                        </Link>
                      </div>
                      {order.customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a href={`tel:${order.customer.phone}`} className="hover:text-primary break-all">
                            {order.customer.phone}
                          </a>
                        </div>
                      )}
                      {order.customer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a href={`mailto:${order.customer.email}`} className="hover:text-primary break-all truncate">
                            {order.customer.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
                      <span className="font-medium">Ürünler: </span>
                      {order.items.slice(0, 2).map((item: any, index: number) => (
                        <span key={item.id}>
                          {item.product.name} x{item.quantity}
                          {index < Math.min(order.items.length, 2) - 1 && ", "}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span> +{order.items.length - 2} ürün daha</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-orange-700">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ödenmemiş
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkAsPaid(order)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                      >
                        <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Ödendi</span>
                        <span className="sm:hidden">Öde</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-shrink-0"
                      >
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Detay</span>
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

      {/* Mark as Paid Dialog */}
      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Olarak İşaretle</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <>
                  <span className="font-semibold">{selectedOrder.orderNumber}</span> siparişini ödendi olarak işaretlemek için ödeme tipini seçin.
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Tutar: {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ödeme Tipi</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Nakit</SelectItem>
                  <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Havale/EFT</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu işlem siparişi veresiye listesinden çıkaracak ve müşteri bakiyesini güncelleyecektir.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMarkPaidDialog(false);
                setSelectedOrder(null);
                setPaymentType("CASH");
              }}
              disabled={markPaidMutation.isPending}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmMarkAsPaid}
              disabled={markPaidMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {markPaidMutation.isPending ? "İşleniyor..." : "Ödendi Olarak İşaretle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

