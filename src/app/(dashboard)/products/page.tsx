"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Package, Search, AlertTriangle, TrendingUp, DollarSign, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

async function fetchProducts(search: string, category: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["products", search, category],
    queryFn: () => fetchProducts(search, category),
  });

  if (isLoading) return <Loading />;

  const totalValue = data?.products?.reduce(
    (sum: number, p: any) => sum + p.stockQuantity * p.purchasePrice,
    0
  ) || 0;

  const lowStockCount = data?.products?.filter((p: any) => p.stockQuantity < 10).length || 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Ürünler"
        description={`${data?.pagination?.total || 0} kayıtlı ürün`}
        actions={
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm">
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Ürün</span>
              <span className="sm:hidden">Yeni</span>
            </Link>
          </Button>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara... (isim veya SKU)"
            className="pl-10 h-10 sm:h-11 bg-white shadow-sm text-sm"
          />
        </div>
        {data?.categories?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={category === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("")}
              className={`text-xs sm:text-sm h-10 ${category === "" ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}`}
            >
              Tümü
            </Button>
            {data.categories.map((cat: string) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={`text-xs sm:text-sm h-10 ${category === cat ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-100">Toplam Ürün</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 break-words">{data?.pagination?.total || 0}</p>
              </div>
              <Package className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-emerald-100">Stok Değeri</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 break-words">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-emerald-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-purple-100">Kategoriler</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 break-words">{data?.categories?.length || 0}</p>
              </div>
              <Layers className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-purple-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className={`h-full ${lowStockCount > 0 ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" : "bg-gradient-to-br from-slate-500 to-slate-600 text-white"}`}>
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-100">Düşük Stok</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 break-words">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-amber-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {data?.products?.length ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((product: any) => (
            <Link key={product.id} href={`/products/${product.id}/edit`}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 sm:p-4 border-b">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {product.sku || "SKU yok"}
                        </p>
                      </div>
                      {product.category && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    {/* Prices */}
                    <div className="flex items-end justify-between gap-2 mb-3 sm:mb-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Satış Fiyatı</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary truncate">{formatCurrency(product.sellPrice)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Alış</p>
                        <p className="text-sm font-medium">{formatCurrency(product.purchasePrice)}</p>
                      </div>
                    </div>

                    {/* Profit margin */}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Kar Marjı</span>
                        <span className="font-medium text-emerald-600">
                          %{((product.sellPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(((product.sellPrice - product.purchasePrice) / product.purchasePrice) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="mt-auto pt-2 sm:pt-3 border-t">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Stok</span>
                        <Badge
                          variant={
                            product.stockQuantity === 0
                              ? "destructive"
                              : product.stockQuantity < 10
                              ? "secondary"
                              : "default"
                          }
                          className={`text-xs ${
                            product.stockQuantity === 0
                              ? ""
                              : product.stockQuantity < 10
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {product.stockQuantity} adet
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Ürün bulunamadı"
          description={search ? "Arama kriterlerine uygun ürün yok" : "Henüz ürün eklenmemiş"}
          action={
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                İlk Ürünü Ekle
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
