"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { customerSchema, CustomerFormData } from "@/lib/validations";
import { useEffect } from "react";

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", params.id],
    queryFn: async () => { const res = await fetch(`/api/customers/${params.id}`); if (!res.ok) throw new Error("Not found"); return res.json(); },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) });

  useEffect(() => { if (customer) reset({ name: customer.name, phone: customer.phone || "", email: customer.email || "", address: customer.address || "", notes: customer.notes || "" }); }, [customer, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => { const res = await fetch(`/api/customers/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Kaydedildi" }); queryClient.invalidateQueries({ queryKey: ["customer", params.id] }); queryClient.invalidateQueries({ queryKey: ["customers"] }); router.push(`/customers/${params.id}`); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  if (isLoading) return <Loading />;
  if (!customer) return <div className="text-center py-12">Müşteri bulunamadı</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Müşteri Düzenle" description={customer.name} />
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

