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
import { customerSchema, CustomerFormData } from "@/lib/validations";

async function createCustomer(data: CustomerFormData) {
  const res = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

export default function NewCustomerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) });
  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => { toast({ title: "Başarılı", description: "Müşteri oluşturuldu." }); router.push(`/customers/${data.id}`); },
    onError: () => toast({ variant: "destructive", title: "Hata", description: "Müşteri oluşturulamadı." }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Müşteri" description="Yeni müşteri bilgilerini girin" />
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 max-w-2xl">
          <div className="space-y-2"><Label>Ad Soyad *</Label><Input {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Telefon</Label><Input type="tel" {...register("phone")} /></div>
            <div className="space-y-2"><Label>E-posta</Label><Input type="email" {...register("email")} /></div>
          </div>
          <div className="space-y-2"><Label>Adres</Label><Textarea {...register("address")} /></div>
          <div className="space-y-2"><Label>Notlar</Label><Textarea {...register("notes")} /></div>
          <div className="flex gap-4">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Kaydet</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
          </div>
        </form>
      </CardContent></Card>
    </div>
  );
}

