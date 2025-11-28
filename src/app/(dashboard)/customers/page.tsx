"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, MoreHorizontal, Eye, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

async function fetchCustomers(search: string) {
  const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function deleteCustomer(id: string) {
  const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Başarılı",
        description: "Müşteri silindi.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Müşteri silinirken bir hata oluştu.",
      });
    },
  });

  const customers = data?.customers || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Müşteriler"
        description="Müşteri listesi ve yönetimi"
        actions={
          <Button asChild size="lg">
            <Link href="/customers/new">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Müşteri
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Müşteri ara (ad, telefon, e-posta)..."
        />
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Müşteri bulunamadı"
          description={
            search
              ? "Arama kriterlerinize uygun müşteri bulunamadı."
              : "Henüz müşteri eklenmemiş. İlk müşterinizi ekleyerek başlayın."
          }
          actionLabel={!search ? "Yeni Müşteri Ekle" : undefined}
          actionHref={!search ? "/customers/new" : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer: any) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-lg font-semibold text-foreground hover:text-primary truncate block"
                    >
                      {customer.name}
                    </Link>
                    
                    <div className="mt-3 space-y-2">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span className="text-sm truncate">{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="text-sm truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {customer._count.orders} sipariş
                        </span>
                        {customer.orders[0] && (
                          <span className="text-muted-foreground">
                            Son: {formatDate(customer.orders[0].orderDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Menü</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/customers/${customer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detay
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/orders/new?customerId=${customer.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Yeni Sipariş
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(customer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        title="Müşteriyi Sil"
        description="Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

