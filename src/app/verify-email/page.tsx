"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Doğrulama kodu bulunamadı.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(result.message);
        } else {
          setStatus("error");
          setMessage(result.error);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Doğrulama sırasında bir hata oluştu.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
            status === "loading" ? "bg-blue-500" :
            status === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
            {status === "loading" && <Loader2 className="h-9 w-9 text-white animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-9 w-9 text-white" />}
            {status === "error" && <XCircle className="h-9 w-9 text-white" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {status === "loading" && "E-posta Doğrulanıyor..."}
              {status === "success" && "E-posta Doğrulandı!"}
              {status === "error" && "Doğrulama Başarısız"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {status === "success" && (
            <Link href="/login">
              <Button size="lg" className="w-full">
                Giriş Yap
              </Button>
            </Link>
          )}
          
          {status === "error" && (
            <div className="space-y-4">
              <Link href="/login">
                <Button size="lg" className="w-full" variant="outline">
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

