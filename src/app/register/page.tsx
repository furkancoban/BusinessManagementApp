"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Loader2, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(6), confirmPassword: z.string(),
  businessName: z.string().min(2), businessAddress: z.string().optional(), businessPhone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, { message: "Şifreler eşleşmiyor", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"user" | "business">("user");

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleNextStep = async () => { if (await trigger(["name", "email", "password", "confirmPassword"])) setStep("business"); };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const userResponse = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.name, email: data.email, password: data.password }) });
      const userResult = await userResponse.json();
      if (!userResponse.ok) throw new Error(userResult.error || "Kullanıcı oluşturulamadı");

      const signInResult = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (signInResult?.error) throw new Error("Giriş yapılamadı");

      const businessResponse = await fetch("/api/business", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.businessName, address: data.businessAddress, phone: data.businessPhone }) });
      if (!businessResponse.ok) throw new Error("İşletme oluşturulamadı");

      await signOut({ redirect: false });
      toast({ title: "Kayıt Başarılı!", description: "E-postanızı doğrulayın." });
      router.push("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            {step === "user" ? <Store className="h-9 w-9 text-primary-foreground" /> : <Building2 className="h-9 w-9 text-primary-foreground" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{step === "user" ? "Hesap Oluştur" : "İşletme Bilgileri"}</CardTitle>
            <CardDescription className="text-base mt-2">{step === "user" ? "Kişisel bilgilerinizi girin" : "İşletmenizin bilgilerini girin"}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === "user" ? (
              <>
                <div className="space-y-2"><Label>Ad Soyad *</Label><Input {...register("name")} disabled={isLoading} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
                <div className="space-y-2"><Label>E-posta *</Label><Input type="email" {...register("email")} disabled={isLoading} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
                <div className="space-y-2"><Label>Şifre *</Label><Input type="password" {...register("password")} disabled={isLoading} />{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}</div>
                <div className="space-y-2"><Label>Şifre Tekrar *</Label><Input type="password" {...register("confirmPassword")} disabled={isLoading} />{errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}</div>
                <Button type="button" size="lg" className="w-full" onClick={handleNextStep} disabled={isLoading}>Devam Et<ArrowRight className="ml-2 h-5 w-5" /></Button>
              </>
            ) : (
              <>
                <div className="space-y-2"><Label>İşletme Adı *</Label><Input {...register("businessName")} disabled={isLoading} />{errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}</div>
                <div className="space-y-2"><Label>Adres</Label><Textarea {...register("businessAddress")} disabled={isLoading} /></div>
                <div className="space-y-2"><Label>Telefon</Label><Input type="tel" {...register("businessPhone")} disabled={isLoading} /></div>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200"><p className="text-sm text-emerald-800"><strong>📦 Demo veriler eklenecek</strong></p></div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep("user")} disabled={isLoading}>Geri</Button>
                  <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Oluşturuluyor...</> : <>Tamamla<ArrowRight className="ml-2 h-5 w-5" /></>}</Button>
                </div>
              </>
            )}
          </form>
          <div className="mt-6 text-center text-sm"><span className="text-muted-foreground">Zaten hesabınız var mı? </span><Link href="/login" className="font-medium text-primary hover:underline">Giriş yapın</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}

