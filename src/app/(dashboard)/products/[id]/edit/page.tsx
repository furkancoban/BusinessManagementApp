"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { productSchema, ProductFormData } from "@/lib/validations";
import { useState, useEffect } from "react";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => { const res = await fetch(`/api/products/${params.id}`); if (!res.ok) throw new Error("Not found"); return res.json(); },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  useEffect(() => { if (product) reset({ name: product.name, sku: product.sku || "", description: product.description || "", category: product.category || "", purchasePrice: product.purchasePrice, sellPrice: product.sellPrice, stockQuantity: product.stockQuantity }); }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => { const res = await fetch(`/api/products/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Kaydedildi" }); queryClient.invalidateQueries({ queryKey: ["products"] }); router.push("/products"); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { const res = await fetch(`/api/products/${params.id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Silindi" }); queryClient.invalidateQueries({ queryKey: ["products"] }); router.push("/products"); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  if (isLoading) return <Loading />;
  if (!product) return <div className="text-center py-12">Ürün bulunamadı</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Ürün Düzenle" description={product.name} actions={<Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Sil</Button>} />
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Ürün Adı *</Label><Input {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>SKU</Label><Input {...register("sku")} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Kategori</Label><Input {...register("category")} /></div>
            <div className="space-y-2"><Label>Stok Miktarı</Label><Input type="number" {...register("stockQuantity", { valueAsNumber: true })} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Alış Fiyatı *</Label><Input type="number" step="0.01" {...register("purchasePrice", { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Satış Fiyatı *</Label><Input type="number" step="0.01" {...register("sellPrice", { valueAsNumber: true })} /></div>
          </div>
          <div className="space-y-2"><Label>Açıklama</Label><Textarea {...register("description")} /></div>
          <div className="flex gap-4">
            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Kaydet</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
          </div>
        </form>
      </CardContent></Card>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Ürünü Sil" description="Bu işlem geri alınamaz." confirmLabel="Sil" variant="destructive" onConfirm={() => deleteMutation.mutate()} />
    </div>
  );
}

