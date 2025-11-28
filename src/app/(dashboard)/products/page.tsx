"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, MoreHorizontal, Pencil, Trash2, Grid3x3, List, Edit2, Check, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatCurrency, calculateProfitMargin } from "@/lib/utils";
import { Input } from "@/components/ui/input";

async function fetchProducts(search: string, category: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category && category !== "all") params.set("category", category);
  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

async function updateProductStock(id: string, stockQuantity: number) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stockQuantity }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update stock");
  }
  return res.json();
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, category],
    queryFn: () => fetchProducts(search, category),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Başarılı",
        description: "Ürün silindi.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün silinirken bir hata oluştu.",
      });
    },
  });

  const stockUpdateMutation = useMutation({
    mutationFn: ({ id, stockQuantity }: { id: string; stockQuantity: number }) =>
      updateProductStock(id, stockQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({
        title: "Başarılı",
        description: "Stok miktarı güncellendi.",
      });
      setEditingStockId(null);
      setEditingStockValue("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Stok güncellenirken bir hata oluştu.",
      });
    },
  });

  const handleStartEditStock = (product: any) => {
    setEditingStockId(product.id);
    setEditingStockValue(product.stockQuantity.toString());
  };

  const handleCancelEditStock = () => {
    setEditingStockId(null);
    setEditingStockValue("");
  };

  const handleSaveStock = (productId: string) => {
    const stockValue = parseInt(editingStockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Geçerli bir stok miktarı giriniz (0 veya daha büyük).",
      });
      return;
    }
    stockUpdateMutation.mutate({ id: productId, stockQuantity: stockValue });
  };

  const products = data?.products || [];
  const categories = data?.categories || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürünler"
        description="Ürün listesi ve yönetimi"
        actions={
          <Button asChild size="lg">
            <Link href="/products/new">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Ürün
            </Link>
          </Button>
        }
      />

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Ürün ara (ad, SKU)..."
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat: string) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </div>

      {/* Product List */}
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
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Ürün bulunamadı"
          description={
            search || category !== "all"
              ? "Arama kriterlerinize uygun ürün bulunamadı."
              : "Henüz ürün eklenmemiş. İlk ürününüzü ekleyerek başlayın."
          }
          actionLabel={!search && category === "all" ? "Yeni Ürün Ekle" : undefined}
          actionHref={!search && category === "all" ? "/products/new" : undefined}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => {
            const profitMargin = calculateProfitMargin(
              product.sellPrice,
              product.purchasePrice
            );

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {product.name}
                        </h3>
                        {product.category && (
                          <Badge variant="secondary" className="shrink-0">
                            {product.category}
                          </Badge>
                        )}
                      </div>

                      {product.sku && (
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {product.sku}
                        </p>
                      )}

                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Alış Fiyatı:</span>
                          <span className="font-medium">
                            {formatCurrency(product.purchasePrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Satış Fiyatı:</span>
                          <span className="font-bold text-lg">
                            {formatCurrency(product.sellPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Kar Marjı:</span>
                          <Badge
                            variant={profitMargin > 20 ? "success" : "secondary"}
                          >
                            %{profitMargin.toFixed(0)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stok:</span>
                          {editingStockId === product.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={editingStockValue}
                                onChange={(e) => setEditingStockValue(e.target.value)}
                                className="w-20 h-8 text-center text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveStock(product.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEditStock();
                                  }
                                }}
                                disabled={stockUpdateMutation.isPending}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleSaveStock(product.id)}
                                disabled={stockUpdateMutation.isPending}
                              >
                                {stockUpdateMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleCancelEditStock}
                                disabled={stockUpdateMutation.isPending}
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  product.stockQuantity > 10
                                    ? "success"
                                    : product.stockQuantity > 0
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {product.stockQuantity} adet
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleStartEditStock(product)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
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
                          <Link href={`/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Ürün</th>
                    <th className="text-left p-4 font-semibold hidden sm:table-cell">SKU</th>
                    <th className="text-left p-4 font-semibold hidden md:table-cell">Kategori</th>
                    <th className="text-right p-4 font-semibold">Alış Fiyatı</th>
                    <th className="text-right p-4 font-semibold">Satış Fiyatı</th>
                    <th className="text-center p-4 font-semibold">Stok</th>
                    <th className="text-right p-4 font-semibold hidden lg:table-cell">Kar Marjı</th>
                    <th className="text-right p-4 font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => {
                    const profitMargin = calculateProfitMargin(
                      product.sellPrice,
                      product.purchasePrice
                    );

                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {product.description}
                              </p>
                            )}
                            <div className="sm:hidden mt-1">
                              {product.sku && (
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              )}
                              {product.category && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-muted-foreground">
                          {product.sku || "-"}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {product.category ? (
                            <Badge variant="secondary">{product.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {formatCurrency(product.purchasePrice)}
                        </td>
                        <td className="p-4 text-right font-semibold">
                          {formatCurrency(product.sellPrice)}
                        </td>
                        <td className="p-4 text-center">
                          {editingStockId === product.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={editingStockValue}
                                onChange={(e) => setEditingStockValue(e.target.value)}
                                className="w-20 h-8 text-center text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveStock(product.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEditStock();
                                  }
                                }}
                                disabled={stockUpdateMutation.isPending}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleSaveStock(product.id)}
                                disabled={stockUpdateMutation.isPending}
                              >
                                {stockUpdateMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleCancelEditStock}
                                disabled={stockUpdateMutation.isPending}
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Badge
                                variant={
                                  product.stockQuantity > 10
                                    ? "default"
                                    : product.stockQuantity > 0
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={
                                  product.stockQuantity > 10
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : product.stockQuantity > 0
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : ""
                                }
                              >
                                {product.stockQuantity} adet
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleStartEditStock(product)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right hidden lg:table-cell">
                          <Badge variant={profitMargin > 20 ? "default" : "secondary"}>
                            %{profitMargin.toFixed(0)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/products/${product.id}/edit`}>
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
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(product.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        title="Ürünü Sil"
        description="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

