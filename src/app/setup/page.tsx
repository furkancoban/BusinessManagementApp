"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function BusinessSetupPage() {
  const router = useRouter();
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "", taxNumber: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast({ variant: "destructive", title: "Hata", description: "İşletme adı gereklidir." }); return; }
    setIsLoading(true);
    try {
      const response = await fetch("/api/business", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast({ title: "Başarılı!", description: "İşletme oluşturuldu." });
      await update({ businessId: result.business.id, businessName: result.business.name, businessSlug: result.business.slug, role: "ADMIN" });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"><Building2 className="h-9 w-9 text-primary-foreground" /></div>
          <div><CardTitle className="text-2xl font-bold">Yeni İşletme Oluştur</CardTitle><CardDescription className="text-base mt-2">Demo veriler otomatik eklenecek.</CardDescription></div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><Label>İşletme Adı *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isLoading} /></div>
            <div className="space-y-2"><Label>Adres</Label><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={isLoading} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Telefon</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={isLoading} /></div>
              <div className="space-y-2"><Label>Vergi No</Label><Input value={formData.taxNumber} onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })} disabled={isLoading} /></div>
            </div>
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Oluşturuluyor...</> : <>İşletme Oluştur<ArrowRight className="ml-2 h-5 w-5" /></>}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

