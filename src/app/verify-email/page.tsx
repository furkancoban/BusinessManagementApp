"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Doğrulama kodu bulunamadı."); return; }
    fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((res) => res.json())
      .then((data) => { if (data.error) { setStatus("error"); setMessage(data.error); } else { setStatus("success"); setMessage("E-posta adresiniz doğrulandı!"); } })
      .catch(() => { setStatus("error"); setMessage("Bir hata oluştu."); });
  }, [token]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${status === "success" ? "bg-green-100" : "bg-red-100"} mb-4`}>
            {status === "success" ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <h2 className="text-xl font-bold mb-2">{status === "success" ? "E-posta Doğrulandı" : "Doğrulama Başarısız"}</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link href="/login"><Button>Giriş Yap</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}><VerifyEmailContent /></Suspense>;
}

