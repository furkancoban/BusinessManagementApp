"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface OrderItem { productId: string; productName: string; quantity: number; unitPrice: number; }

export default function NewOrderPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const { data: customersData, isLoading: loadingC } = useQuery({ queryKey: ["customers-list"], queryFn: async () => { const res = await fetch("/api/customers?limit=100"); return res.json(); } });
  const { data: productsData, isLoading: loadingP } = useQuery({ queryKey: ["products-list"], queryFn: async () => { const res = await fetch("/api/products?limit=100"); return res.json(); } });

  const mutation = useMutation({
    mutationFn: async (data: any) => { const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: (data) => { toast({ title: "Sipariş oluşturuldu" }); router.push(`/orders/${data.id}`); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  const addItem = () => {
    if (!selectedProduct) return;
    const product = productsData?.products?.find((p: any) => p.id === selectedProduct);
    if (!product || items.some((i) => i.productId === selectedProduct)) return;
    setItems([...items, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.sellPrice }]);
    setSelectedProduct("");
  };

  const updateQuantity = (idx: number, qty: number) => { const newItems = [...items]; newItems[idx].quantity = Math.max(1, qty); setItems(newItems); };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = () => {
    if (!customerId) { toast({ variant: "destructive", description: "Müşteri seçin" }); return; }
    if (items.length === 0) { toast({ variant: "destructive", description: "Ürün ekleyin" }); return; }
    mutation.mutate({ customerId, paymentType, items: items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })) });
  };

  if (loadingC || loadingP) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Sipariş" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle>Müşteri & Ödeme</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Müşteri *</Label>
              <Select value={customerId} onValueChange={setCustomerId}><SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger><SelectContent>{customersData?.customers?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Ödeme Tipi</Label>
              <Select value={paymentType} onValueChange={setPaymentType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CASH">Nakit</SelectItem><SelectItem value="CARD">Kart</SelectItem><SelectItem value="TRANSFER">Havale/EFT</SelectItem><SelectItem value="VERESIYE">Veresiye (Ödenecek)</SelectItem></SelectContent></Select>
            </div>
            {paymentType === "VERESIYE" && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">Veresiye Ödeme</p>
                    <p className="text-xs text-amber-700 mt-1">Bu sipariş daha sonra ödenecek olarak işaretlenecektir. Müşteri ödeme yaptığında sipariş detayından ödeme tipini güncelleyebilirsiniz.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Ürünler</CardTitle></CardHeader><CardContent>
            <div className="flex gap-2 mb-4">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}><SelectTrigger><SelectValue placeholder="Ürün seçin" /></SelectTrigger><SelectContent>{productsData?.products?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} - {formatCurrency(p.sellPrice)}</SelectItem>)}</SelectContent></Select>
              <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
            </div>
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1"><p className="font-medium">{item.productName}</p><p className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice)}</p></div>
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)} className="w-20" />
                    <p className="font-semibold w-24 text-right">{formatCurrency(item.quantity * item.unitPrice)}</p>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </div>
        <div>
          <Card className="sticky top-24"><CardHeader><CardTitle>Özet</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex justify-between text-lg"><span>Toplam</span><span className="font-bold">{formatCurrency(total)}</span></div>
            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Siparişi Oluştur</Button>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}

