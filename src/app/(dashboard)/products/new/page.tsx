"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { productSchema, ProductFormData } from "@/lib/validations";

export default function NewProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({ resolver: zodResolver(productSchema), defaultValues: { stockQuantity: 0, purchasePrice: 0, sellPrice: 0 } });
  
  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => { const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Başarılı" }); router.push("/products"); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Ürün" />
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 max-w-2xl">
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
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Kaydet</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
          </div>
        </form>
      </CardContent></Card>
    </div>
  );
}

