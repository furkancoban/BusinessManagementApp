"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingCart,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  paymentTypeLabels,
  orderStatusLabels,
  orderStatusColors,
} from "@/lib/utils";

async function fetchCustomer(id: string) {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}

async function deleteCustomer(id: string, password: string) {
  const res = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete customer");
  }
  return res.json();
}

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", params.id],
    queryFn: () => fetchCustomer(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      deleteCustomer(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Başarılı",
        description: "Müşteri silindi.",
      });
      setShowDeleteDialog(false);
      setDeletePassword("");
      setDeleteError(null);
      router.push("/customers");
    },
    onError: (error: Error) => {
      setDeleteError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Müşteri silinirken bir hata oluştu.",
      });
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!customer) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Müşteri bulunamadı"
        description="Bu müşteri mevcut değil veya silinmiş olabilir."
        actionLabel="Müşterilere Dön"
        actionHref="/customers"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description="Müşteri detayları ve sipariş geçmişi"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/customers">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Geri
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/customers/${customer.id}/edit`}>
                <Pencil className="mr-2 h-5 w-5" />
                Düzenle
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/orders/new?customerId=${customer.id}`}>
                <Plus className="mr-2 h-5 w-5" />
                Yeni Sipariş
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{customer.notes}</span>
              </div>
            )}

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Sipariş</p>
                <p className="text-2xl font-bold">{customer.stats.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customer.stats.totalSpent)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Ortalama Sipariş</p>
              <p className="text-xl font-semibold">
                {formatCurrency(customer.stats.averageOrder)}
              </p>
            </div>

            <Separator />

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Müşteriyi Sil
            </Button>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Sipariş Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Sipariş bulunamadı"
                description="Bu müşterinin henüz siparişi bulunmuyor."
                actionLabel="Yeni Sipariş"
                actionHref={`/orders/new?customerId=${customer.id}`}
              />
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(order.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <Badge
                          className={orderStatusColors[order.status]}
                          variant="secondary"
                        >
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </div>
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
                    <div className="mt-2">
                      <Badge variant="outline">
                        {paymentTypeLabels[order.paymentType]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog with Password */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Müşteriyi Sil
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                ⚠️ Bu müşterinin veresiye siparişleri varsa silme işlemi yapılamaz.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Güvenlik için şifrenizi girin:</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError(null);
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deletePassword && !deleteMutation.isPending) {
                    deleteMutation.mutate({
                      id: params.id,
                      password: deletePassword,
                    });
                  }
                }}
              />
              {deleteError && (
                <p className="text-sm text-destructive mt-2">{deleteError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword("");
                setDeleteError(null);
              }}
              disabled={deleteMutation.isPending}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deletePassword) {
                  toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Lütfen şifrenizi girin.",
                  });
                  return;
                }
                deleteMutation.mutate({
                  id: params.id,
                  password: deletePassword,
                });
              }}
              disabled={!deletePassword || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

