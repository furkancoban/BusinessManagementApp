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

const registerWithBusinessSchema = z.object({
  // User info
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
  // Business info
  businessName: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessTaxNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterWithBusinessData = z.infer<typeof registerWithBusinessSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"user" | "business">("user");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterWithBusinessData>({
    resolver: zodResolver(registerWithBusinessSchema),
  });

  const handleNextStep = async () => {
    const valid = await trigger(["name", "email", "password", "confirmPassword"]);
    if (valid) {
      setStep("business");
    }
  };

  const onSubmit = async (data: RegisterWithBusinessData) => {
    setIsLoading(true);

    try {
      // Step 1: Create user
      const userResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const userResult = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userResult.error || "Kullanıcı oluşturulamadı");
      }

      // Step 2: Sign in to get session
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Giriş yapılamadı");
      }

      // Step 3: Create business
      const businessResponse = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.businessName,
          address: data.businessAddress,
          phone: data.businessPhone,
          email: data.businessEmail,
          taxNumber: data.businessTaxNumber,
        }),
      });

      const businessResult = await businessResponse.json();

      if (!businessResponse.ok) {
        throw new Error(businessResult.error || "İşletme oluşturulamadı");
      }

      // Sign out so user can log in fresh with their new business
      await signOut({ redirect: false });

      toast({
        title: "Kayıt Başarılı!",
        description: "Hesabınız oluşturuldu. Lütfen e-postanızı doğrulayın.",
      });

      // Redirect to login page
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal-100 opacity-50 blur-3xl" />
      </div>

      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            {step === "user" ? (
              <Store className="h-9 w-9 text-primary-foreground" />
            ) : (
              <Building2 className="h-9 w-9 text-primary-foreground" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {step === "user" ? "Hesap Oluştur" : "İşletme Bilgileri"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {step === "user"
                ? "Kişisel bilgilerinizi girin"
                : "İşletmenizin bilgilerini girin"}
            </CardDescription>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`h-2 w-8 rounded-full ${
                step === "user" ? "bg-primary" : "bg-primary/30"
              }`}
            />
            <div
              className={`h-2 w-8 rounded-full ${
                step === "business" ? "bg-primary" : "bg-primary/30"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === "user" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    placeholder="Ahmet Yılmaz"
                    {...register("name")}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ornek.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="w-full text-lg"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  Devam Et
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">İşletme Adı *</Label>
                  <Input
                    id="businessName"
                    placeholder="Örnek: Güneş Ticaret"
                    {...register("businessName")}
                    disabled={isLoading}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Adres</Label>
                  <Textarea
                    id="businessAddress"
                    placeholder="İşletme adresi"
                    {...register("businessAddress")}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Telefon</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="0212 123 4567"
                      {...register("businessPhone")}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessTaxNumber">Vergi No</Label>
                    <Input
                      id="businessTaxNumber"
                      placeholder="1234567890"
                      {...register("businessTaxNumber")}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    <strong>📦 Otomatik Eklenecekler:</strong>
                    <br />• 3 örnek müşteri
                    <br />• 3 örnek ürün
                    <br />• 1 örnek sipariş
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep("user")}
                    disabled={isLoading}
                  >
                    Geri
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        Tamamla
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

