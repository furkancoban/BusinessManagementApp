"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, Eye, EyeOff, Loader2, LogIn, Building2, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
});

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setShowResendVerification(false);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("doğrula") || result.error.includes("verify")) {
          setShowResendVerification(true);
          setResendEmail(data.email);
          toast({
            variant: "destructive",
            title: "E-posta Doğrulanmamış",
            description: "Lütfen e-posta adresinizi doğrulayın.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Giriş Başarısız",
            description: "E-posta veya şifre hatalı.",
          });
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kayıt başarısız");
      }

      toast({
        title: "Kayıt Başarılı!",
        description: "E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.",
      });

      // Switch to login tab
      setActiveTab("login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Kayıt sırasında bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const result = await response.json();

      toast({
        title: "Gönderildi",
        description: result.message || "Doğrulama e-postası gönderildi.",
      });
      setShowResendVerification(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "E-posta gönderilemedi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl">
              <Store className="h-11 w-11 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">İşletme Yönetim Sistemi</CardTitle>
              <CardDescription className="text-base mt-2">
                {activeTab === "login" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
              </CardDescription>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setShowResendVerification(false);
                }}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                  activeTab === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Kayıt Ol
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...registerLogin("email")}
                    className={loginErrors.email ? "border-destructive" : ""}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base">
                      Şifre
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...registerLogin("password")}
                      className={loginErrors.password ? "border-destructive pr-12" : "pr-12"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>

                {showResendVerification && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800 mb-3">
                      E-posta adresiniz henüz doğrulanmamış. Doğrulama e-postasını tekrar göndermek ister misiniz?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Doğrulama E-postası Gönder
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Giriş Yap
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-base">
                    Ad Soyad
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    disabled={isLoading}
                    {...registerRegister("name")}
                    className={registerErrors.name ? "border-destructive" : ""}
                  />
                  {registerErrors.name && (
                    <p className="text-sm text-destructive">{registerErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-base">
                    E-posta
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...registerRegister("email")}
                    className={registerErrors.email ? "border-destructive" : ""}
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-destructive">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-base">
                    Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...registerRegister("password")}
                      className={registerErrors.password ? "border-destructive pr-12" : "pr-12"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-sm text-destructive">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-base">
                    Şifre Tekrar
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...registerRegister("confirmPassword")}
                      className={registerErrors.confirmPassword ? "border-destructive pr-12" : "pr-12"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showRegisterConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{registerErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 E-posta Doğrulama:</strong>
                    <br />
                    Kayıt olduktan sonra e-posta adresinize doğrulama linki gönderilecektir. Hesabınızı aktifleştirmek için e-postanızı kontrol edin.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Kayıt yapılıyor...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Kayıt Ol
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Kayıt olduktan sonra{" "}
                  <Link href="/setup" className="text-primary hover:underline font-medium">
                    işletme oluşturma
                  </Link>{" "}
                  sayfasına yönlendirileceksiniz.
                </div>
              </form>
            )}

            {activeTab === "login" && (
              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600 text-center">
                  <strong>Demo Giriş Bilgileri:</strong>
                  <br />
                  E-posta: admin@isletme.com
                  <br />
                  Şifre: admin123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
