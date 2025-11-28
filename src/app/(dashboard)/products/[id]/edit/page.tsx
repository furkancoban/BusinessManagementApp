"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { productSchema, ProductFormData } from "@/lib/validations";

async function fetchProduct(id: string) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

async function updateProduct(id: string, data: ProductFormData) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update product");
  }
  return res.json();
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku || "",
        description: product.description || "",
        category: product.category || "",
        purchasePrice: product.purchasePrice,
        sellPrice: product.sellPrice,
        stockQuantity: product.stockQuantity,
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", params.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Başarılı",
        description: "Ürün bilgileri güncellendi.",
      });
      router.push("/products");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Ürün güncellenirken bir hata oluştu.",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürün Düzenle"
        description={product?.name}
        actions={
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Geri
            </Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                placeholder="Ürün adı"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Ürün Kodu</Label>
                <Input id="sku" placeholder="LP-001" {...register("sku")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  placeholder="Elektronik, Aksesuar..."
                  {...register("category")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                placeholder="Ürün açıklaması"
                {...register("description")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Alış Fiyatı (₺) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("purchasePrice")}
                  className={errors.purchasePrice ? "border-destructive" : ""}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-destructive">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellPrice">Satış Fiyatı (₺) *</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("sellPrice")}
                  className={errors.sellPrice ? "border-destructive" : ""}
                />
                {errors.sellPrice && (
                  <p className="text-sm text-destructive">
                    {errors.sellPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stok Miktarı</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                placeholder="0"
                {...register("stockQuantity")}
                className={errors.stockQuantity ? "border-destructive" : ""}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Değişiklikleri Kaydet"
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link href="/products">İptal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

