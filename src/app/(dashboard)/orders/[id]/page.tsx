"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import {
  ArrowLeft,
  Printer,
  Download,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  paymentTypeLabels,
  orderStatusLabels,
  orderStatusColors,
} from "@/lib/utils";

async function fetchOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

async function deleteOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete order");
  return res.json();
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => fetchOrder(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Başarılı",
        description: "Sipariş silindi.",
      });
      router.push("/orders");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sipariş silinirken bir hata oluştu.",
      });
    },
  });

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: data?.order?.orderNumber || "Fis",
  });

  if (isLoading) {
    return <Loading />;
  }

  const order = data?.order;
  const businessInfo = data?.businessInfo;

  if (!order) {
    return (
      <EmptyState
        icon={FileText}
        title="Sipariş bulunamadı"
        description="Bu sipariş mevcut değil veya silinmiş olabilir."
        actionLabel="Siparişlere Dön"
        actionHref="/orders"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sipariş ${order.orderNumber}`}
        description={`${order.customer.name} - ${formatDateTime(order.orderDate)}`}
        actions={
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Geri
              </Link>
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-5 w-5" />
              Yazdır
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Sil
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Sipariş Bilgileri</CardTitle>
              <Badge
                className={orderStatusColors[order.status]}
                variant="secondary"
              >
                {orderStatusLabels[order.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sipariş No</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarih</p>
                <p className="font-semibold">{formatDateTime(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ödeme Tipi</p>
                <Badge variant="outline">
                  {paymentTypeLabels[order.paymentType]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Notlar</p>
                  <p className="mt-1">{order.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Customer Info */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Müşteri
              </p>
              <Link
                href={`/customers/${order.customer.id}`}
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <p className="font-semibold">{order.customer.name}</p>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4" />
                    {order.customer.phone}
                  </div>
                )}
                {order.customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    {order.customer.email}
                  </div>
                )}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sipariş Kalemleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Toplam</span>
              <span className="text-2xl font-bold">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipt Preview (Printable) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Fiş Önizleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={receiptRef}
            className="max-w-md mx-auto bg-white text-black p-6 font-mono text-sm"
            style={{ fontFamily: "monospace" }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">
                {businessInfo?.name || "İşletme Yönetim Sistemi"}
              </h2>
              {businessInfo?.address && (
                <p className="text-xs">{businessInfo.address}</p>
              )}
              {businessInfo?.phone && (
                <p className="text-xs">Tel: {businessInfo.phone}</p>
              )}
              {businessInfo?.taxNumber && (
                <p className="text-xs">Vergi No: {businessInfo.taxNumber}</p>
              )}
            </div>

            <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
              <p>Sipariş No: {order.orderNumber}</p>
              <p>Tarih: {formatDateTime(order.orderDate)}</p>
            </div>

            {/* Customer */}
            <div className="border-b border-dashed border-gray-400 py-2 mb-2">
              <p>Müşteri: {order.customer.name}</p>
              {order.customer.phone && <p>Tel: {order.customer.phone}</p>}
            </div>

            {/* Items */}
            <table className="w-full mb-2">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="text-left py-1">Ürün</th>
                  <th className="text-center py-1">Adet</th>
                  <th className="text-right py-1">Fiyat</th>
                  <th className="text-right py-1">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-1 text-xs">{item.product.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="text-right py-1">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-400 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>TOPLAM:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 py-2 mt-2">
              <p>Ödeme: {paymentTypeLabels[order.paymentType]}</p>
              <p>Durum: {orderStatusLabels[order.status]}</p>
            </div>

            {order.notes && (
              <div className="border-t border-dashed border-gray-400 py-2 mt-2">
                <p className="text-xs">Not: {order.notes}</p>
              </div>
            )}

            <div className="text-center mt-4 pt-2 border-t border-gray-400">
              <p className="font-bold">Teşekkür ederiz!</p>
              <p className="text-xs">Yine bekleriz...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Siparişi Sil"
        description="Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate(params.id)}
      />
    </div>
  );
}

