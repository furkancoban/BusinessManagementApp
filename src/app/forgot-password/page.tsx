"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4"><CheckCircle className="h-8 w-8 text-green-600" /></div>
            <h2 className="text-xl font-bold mb-2">E-posta Gönderildi</h2>
            <p className="text-muted-foreground mb-6">Şifre sıfırlama bağlantısı gönderildi. E-postanızı kontrol edin.</p>
            <Link href="/login"><Button><ArrowLeft className="mr-2 h-4 w-4" />Giriş Sayfasına Dön</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2"><Mail className="h-7 w-7 text-primary" /></div>
          <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
          <CardDescription>E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" disabled={isLoading} /></div>
            <Button type="submit" className="w-full" disabled={isLoading || !email}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sıfırlama Bağlantısı Gönder</Button>
          </form>
          <div className="mt-4 text-center"><Link href="/login" className="text-sm text-primary hover:underline"><ArrowLeft className="inline h-4 w-4 mr-1" />Giriş sayfasına dön</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}

