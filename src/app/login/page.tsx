"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, Eye, EyeOff, Loader2, LogIn, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (result?.error) {
        toast({ variant: "destructive", title: "Giriş Başarısız", description: result.error.includes("doğrula") ? "E-postanızı doğrulayın" : "E-posta veya şifre hatalı" });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Bir hata oluştu" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl">
              <Store className="h-11 w-11 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">İşletme Yönetim Sistemi</CardTitle>
              <CardDescription className="text-base mt-2">Hesabınıza giriş yapın</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@email.com" disabled={isLoading} {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">Şifremi unuttum</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" disabled={isLoading} {...register("password")} className="pr-12" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full text-lg bg-gradient-to-r from-blue-600 to-indigo-700" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Giriş yapılıyor...</> : <><LogIn className="mr-2 h-5 w-5" />Giriş Yap</>}
              </Button>
            </form>
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600 text-center"><strong>Demo:</strong> admin@isletme.com / admin123</p>
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">Yeni bir işletme mi başlatıyorsunuz?</p>
              <Link href="/register"><Button variant="outline" size="lg" className="w-full border-2 border-dashed"><Building2 className="mr-2 h-5 w-5" />Yeni İşletme Oluştur</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

