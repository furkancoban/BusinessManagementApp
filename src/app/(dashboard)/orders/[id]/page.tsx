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
  const debtInfo = data?.debtInfo;

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
              {order.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Ödeme Tarihi</p>
                  <p className="font-semibold">{formatDateTime(order.paidAt)}</p>
                </div>
              )}
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
            className="max-w-md mx-auto bg-white text-black p-6"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {/* Header - Modern Business Style */}
            <div className="text-center mb-4 border-b-2 border-gray-800 pb-3">
              <h2 className="text-2xl font-bold mb-1 uppercase tracking-wide">
                {businessInfo?.name || "İşletme Yönetim Sistemi"}
              </h2>
              {businessInfo?.address && (
                <p className="text-xs font-medium">{businessInfo.address}</p>
              )}
              {businessInfo?.phone && (
                <p className="text-xs font-medium mt-1">Tel: {businessInfo.phone}</p>
              )}
            </div>

            {/* Order Info */}
            <div className="border-b border-dashed border-gray-400 py-2 my-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Sipariş No:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Tarih:</span>
                <span>{formatDateTime(order.orderDate)}</span>
              </div>
            </div>

            {/* Customer Info - Enhanced */}
            <div className="border-b-2 border-gray-800 py-3 mb-3">
              <p className="font-bold text-sm mb-2 uppercase">Müşteri Bilgileri</p>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Adı: {order.customer.name}</p>
                {order.customer.phone && (
                  <p>Telefon: {order.customer.phone}</p>
                )}
                {order.customer.address && (
                  <p className="text-xs">Adres: {order.customer.address}</p>
                )}
              </div>
            </div>

            {/* Items Table - Modern */}
            <div className="mb-3">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 text-xs font-bold uppercase">Ürün</th>
                    <th className="text-center py-2 text-xs font-bold uppercase">Adet</th>
                    <th className="text-right py-2 text-xs font-bold uppercase">Birim Fiyat</th>
                    <th className="text-right py-2 text-xs font-bold uppercase">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any, index: number) => (
                    <tr key={item.id} className={index !== order.items.length - 1 ? "border-b border-gray-300" : ""}>
                      <td className="py-2 text-sm">{item.product.name}</td>
                      <td className="text-center py-2 text-sm font-medium">{item.quantity}</td>
                      <td className="text-right py-2 text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-2 text-sm font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-800 pt-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Toplam Ürün Adedi:</span>
                <span className="font-bold">{order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} adet</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-400">
                <span className="text-lg font-bold uppercase">Genel Toplam:</span>
                <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment & Status Info */}
            <div className="border-t border-dashed border-gray-400 py-3 mb-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Ödeme Yöntemi:</span>
                  <p className="mt-1">{paymentTypeLabels[order.paymentType]}</p>
                </div>
                <div>
                  <span className="font-semibold">Sipariş Durumu:</span>
                  <p className="mt-1">{orderStatusLabels[order.status]}</p>
                </div>
              </div>
              
              {/* Debt Information */}
              {debtInfo && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-400">
                  <p className="font-bold text-sm mb-1">Borç Bilgileri:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Önceki Borç:</span>
                      <span className="font-semibold">{formatCurrency(debtInfo.previousDebt)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Toplam Borç:</span>
                      <span>{formatCurrency(debtInfo.totalDebtAfter)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="border-t border-dashed border-gray-400 py-3 mb-3">
                <p className="font-semibold text-sm mb-1">Sipariş Notu:</p>
                <p className="text-xs">{order.notes}</p>
              </div>
            )}

            {/* Customer Satisfaction Note */}
            <div className="border-t-2 border-gray-800 pt-4 mt-4 text-center">
              <p className="text-xs font-semibold mb-2 text-gray-700">
                ✨ Memnuniyetiniz bizim için önemlidir ✨
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Görüş ve önerileriniz için bizimle iletişime geçebilirsiniz.
              </p>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t-2 border-gray-800">
              <p className="font-bold text-sm mb-2 uppercase">Bilgi Fişidir</p>
              <p className="font-bold text-lg mb-1">Teşekkür Ederiz!</p>
              <p className="text-xs text-gray-600">Yine bekleriz...</p>
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

