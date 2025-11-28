"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { setValidating(false); return; }
    fetch(`/api/auth/reset-password?token=${token}`).then((res) => res.json()).then((data) => { setValid(data.valid); setValidating(false); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast({ variant: "destructive", description: "Şifreler eşleşmiyor" }); return; }
    if (password.length < 6) { toast({ variant: "destructive", description: "Şifre en az 6 karakter" }); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (!token || !valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4"><XCircle className="h-8 w-8 text-red-600" /></div>
            <h2 className="text-xl font-bold mb-2">Geçersiz Bağlantı</h2>
            <p className="text-muted-foreground mb-6">Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.</p>
            <Link href="/forgot-password"><Button>Yeni Bağlantı İste</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4"><CheckCircle className="h-8 w-8 text-green-600" /></div>
            <h2 className="text-xl font-bold mb-2">Şifre Değiştirildi</h2>
            <p className="text-muted-foreground mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
            <Link href="/login"><Button>Giriş Yap</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2"><Lock className="h-7 w-7 text-primary" /></div>
          <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
          <CardDescription>Hesabınız için yeni bir şifre oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Yeni Şifre</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} /></div>
            <div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} /></div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Şifreyi Değiştir</Button>
          </form>
          <div className="mt-4 text-center"><Link href="/login" className="text-sm text-primary hover:underline"><ArrowLeft className="inline h-4 w-4 mr-1" />Giriş sayfasına dön</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}><ResetPasswordContent /></Suspense>;
}

