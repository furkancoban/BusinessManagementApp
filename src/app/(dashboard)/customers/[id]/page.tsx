"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", params.id],
    queryFn: async () => { const res = await fetch(`/api/customers/${params.id}`); if (!res.ok) throw new Error("Not found"); return res.json(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { const res = await fetch(`/api/customers/${params.id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Silindi" }); queryClient.invalidateQueries({ queryKey: ["customers"] }); router.push("/customers"); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  if (isLoading) return <Loading />;
  if (!customer) return <div className="text-center py-12">Müşteri bulunamadı</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={customer.name} description={`${customer._count?.orders || 0} sipariş`} actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Geri</Button>
          <Button asChild><Link href={`/customers/${params.id}/edit`}><Edit className="mr-2 h-4 w-4" />Düzenle</Link></Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Sil</Button>
        </div>
      } />
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>İletişim Bilgileri</CardTitle></CardHeader><CardContent className="space-y-4">
          {customer.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><span>{customer.phone}</span></div>}
          {customer.email && <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><span>{customer.email}</span></div>}
          {customer.address && <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><span>{customer.address}</span></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Satış İstatistikleri</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex justify-between"><span>Toplam Sipariş</span><span className="font-bold">{customer.stats?.totalOrders || 0}</span></div>
          <div className="flex justify-between"><span>Toplam Harcama</span><span className="font-bold">{formatCurrency(customer.stats?.totalSpent || 0)}</span></div>
          <div className="flex justify-between"><span>Ortalama Sipariş</span><span className="font-bold">{formatCurrency(customer.stats?.averageOrder || 0)}</span></div>
        </CardContent></Card>
      </div>
      {customer.orders?.length > 0 && (
        <Card><CardHeader><CardTitle>Sipariş Geçmişi</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">
            {customer.orders.map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block p-4 rounded-lg border hover:bg-muted/50">
                <div className="flex justify-between items-center">
                  <div><p className="font-medium">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{formatDateTime(order.orderDate)}</p></div>
                  <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent></Card>
      )}
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Müşteriyi Sil" description="Bu işlem geri alınamaz." confirmLabel="Sil" variant="destructive" onConfirm={() => deleteMutation.mutate()} />
    </div>
  );
}

