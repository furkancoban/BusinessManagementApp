"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, MoreHorizontal, Eye, Pencil, Trash2, Phone, Mail, Grid3x3, List, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV, formatDateForExport } from "@/lib/export";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  const handleExport = () => {
    if (!customers.length) return;
    
    const exportData = customers.map((customer: any) => ({
      "Müşteri Adı": customer.name,
      "Telefon": customer.phone || "-",
      "E-posta": customer.email || "-",
      "Adres": customer.address || "-",
      "Notlar": customer.notes || "-",
      "Kayıt Tarihi": customer.createdAt ? formatDateForExport(customer.createdAt) : "-",
    }));
    
    exportToCSV(exportData, `musteriler-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Müşteriler"
        description="Müşteri listesi ve yönetimi"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isLoading || !customers.length}
              className="hidden sm:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
            <Button asChild size="default" className="w-full sm:w-auto">
              <Link href="/customers/new">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Yeni Müşteri</span>
                <span className="sm:hidden">Yeni</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="max-w-md w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Müşteri ara (ad, telefon, e-posta)..."
          />
        </div>
        <div className="flex gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
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
      ) : viewMode === "grid" ? (
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
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Müşteri</th>
                    <th className="text-left p-4 font-semibold hidden sm:table-cell">Telefon</th>
                    <th className="text-left p-4 font-semibold hidden md:table-cell">E-posta</th>
                    <th className="text-center p-4 font-semibold">Sipariş</th>
                    <th className="text-left p-4 font-semibold hidden lg:table-cell">Son Sipariş</th>
                    <th className="text-right p-4 font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer: any) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {customer.name}
                        </Link>
                        <div className="sm:hidden mt-1 text-sm text-muted-foreground">
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {customer.phone ? (
                            <>
                              <Phone className="h-4 w-4" />
                              <span>{customer.phone}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {customer.email ? (
                            <>
                              <Mail className="h-4 w-4" />
                              <span className="truncate max-w-[200px]">{customer.email}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary">{customer._count.orders}</Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {customer.orders[0] ? formatDate(customer.orders[0].orderDate) : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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

