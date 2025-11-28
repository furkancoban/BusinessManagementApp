"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Printer, Receipt, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatDateTime, paymentTypeLabels, orderStatusLabels } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState("CASH");

  const { data, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: async () => { const res = await fetch(`/api/orders/${params.id}`); if (!res.ok) throw new Error("Not found"); return res.json(); },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async (paymentType: string) => {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentType }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ödeme tipi güncellendi", description: "Sipariş başarıyla güncellendi." });
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setMarkPaidDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Hata", description: "Ödeme tipi güncellenemedi." });
    },
  });

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "", "width=400,height=600");
    if (!win) return;
    win.document.write(`<html><head><title>Fiş</title><style>body{font-family:monospace;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:4px 0}th:last-child,td:last-child{text-align:right}.center{text-align:center}.bold{font-weight:bold}.line{border-bottom:1px dashed #000;margin:8px 0}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  if (isLoading) return <Loading />;
  if (!data?.order) return <div className="text-center py-12">Sipariş bulunamadı</div>;

  const { order, businessInfo } = data;

  return (
    <div className="space-y-6">
      <PageHeader title={order.orderNumber} description={formatDateTime(order.orderDate)} actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Geri</Button>
          {order.paymentType === "VERESIYE" && (
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              onClick={() => setMarkPaidDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ödendi Olarak İşaretle
            </Button>
          )}
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Yazdır</Button>
        </div>
      } />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={order.paymentType === "VERESIYE" ? "border-2 border-amber-200 bg-amber-50/30" : ""}><CardHeader><CardTitle>Sipariş Bilgileri</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex justify-between"><span>Durum</span><Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>{orderStatusLabels[order.status]}</Badge></div>
          <div className="flex justify-between items-center">
            <span>Ödeme</span>
            <div className="flex items-center gap-2">
              {order.paymentType === "VERESIYE" && <Receipt className="h-4 w-4 text-amber-600" />}
              <span className={order.paymentType === "VERESIYE" ? "font-semibold text-amber-700" : ""}>{paymentTypeLabels[order.paymentType]}</span>
              {order.paymentType === "VERESIYE" && (
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-100">
                  Ödenmedi
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span>Toplam</span>
            <span className={`font-bold text-right break-words ${
              order.paymentType === "VERESIYE" ? "text-amber-700" : ""
            } ${
              order.totalAmount >= 1000000
                ? "text-base sm:text-lg"
                : order.totalAmount >= 100000
                ? "text-lg sm:text-xl"
                : "text-lg"
            }`}>
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Müşteri</CardTitle></CardHeader><CardContent>
          <Link href={`/customers/${order.customer.id}`} className="hover:underline"><p className="font-semibold text-lg">{order.customer.name}</p></Link>
          {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Ürünler</CardTitle></CardHeader><CardContent>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg gap-3">
              <div className="min-w-0 flex-1"><p className="font-medium">{item.product.name}</p><p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.unitPrice)}</p></div>
              <p className={`font-bold text-right shrink-0 break-words ${
                item.subtotal >= 1000000
                  ? "text-sm sm:text-base"
                  : item.subtotal >= 100000
                  ? "text-base sm:text-lg"
                  : "text-base"
              }`}>
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </CardContent></Card>
      <div className="hidden">
        <div ref={receiptRef}>
          <div className="center bold">{businessInfo?.name || "İşletme"}</div>
          {businessInfo?.address && <div className="center">{businessInfo.address}</div>}
          {businessInfo?.phone && <div className="center">{businessInfo.phone}</div>}
          <div className="line"></div>
          <div><strong>Fiş No:</strong> {order.orderNumber}</div>
          <div><strong>Tarih:</strong> {formatDateTime(order.orderDate)}</div>
          <div><strong>Müşteri:</strong> {order.customer.name}</div>
          <div className="line"></div>
          <table><thead><tr><th>Ürün</th><th>Tutar</th></tr></thead><tbody>
            {order.items.map((item: any) => <tr key={item.id}><td>{item.product.name} x{item.quantity}</td><td>{formatCurrency(item.subtotal)}</td></tr>)}
          </tbody></table>
          <div className="line"></div>
          <div className="bold" style={{display:"flex",justifyContent:"space-between"}}><span>TOPLAM</span><span>{formatCurrency(order.totalAmount)}</span></div>
          <div><strong>Ödeme:</strong> {paymentTypeLabels[order.paymentType]}{order.paymentType === "VERESIYE" ? " (Ödenecek)" : ""}</div>
          <div className="line"></div>
          <div className="center">Teşekkür ederiz!</div>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Olarak İşaretle</DialogTitle>
            <DialogDescription>
              Bu veresiye siparişi ödendi olarak işaretlemek için ödeme tipini seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Ödeme Tipi</label>
              <Select value={newPaymentType} onValueChange={setNewPaymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Nakit</SelectItem>
                  <SelectItem value="CARD">Kart</SelectItem>
                  <SelectItem value="TRANSFER">Havale/EFT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-900">
                <strong>Tutar:</strong> {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={() => updatePaymentMutation.mutate(newPaymentType)}
              disabled={updatePaymentMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {updatePaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Ödendi Olarak İşaretle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
