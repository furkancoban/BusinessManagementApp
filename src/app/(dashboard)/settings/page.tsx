"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, Users, Building2, Lock, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const [businessInfo, setBusinessInfo] = useState({ name: "", address: "", phone: "", email: "", taxNumber: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: async () => { const res = await fetch("/api/settings"); return res.json(); } });
  const { data: usersData } = useQuery({ queryKey: ["users"], queryFn: async () => { const res = await fetch("/api/users"); return res.json(); }, enabled: session?.user?.role === "ADMIN" });

  useEffect(() => { if (settings?.businessInfo) setBusinessInfo(settings.businessInfo); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => { const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(businessInfo) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: async (data) => { 
      toast({ title: "Kaydedildi! Sayfa yenileniyor..." }); 
      queryClient.invalidateQueries({ queryKey: ["settings"] }); 
      // Fetch latest business info and update session
      if (session?.user?.businessId) {
        try {
          const refreshRes = await fetch("/api/session/refresh", { method: "POST" });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            await update({ 
              businessId: refreshData.businessId,
              businessName: refreshData.businessName,
              businessSlug: refreshData.businessSlug,
              role: session.user.role
            });
          }
        } catch (error) {
          console.error("Session refresh error:", error);
        }
      }
      // Force immediate page reload to ensure all components get updated session
      window.location.reload();
    },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => { const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error); return data; },
    onSuccess: () => { toast({ title: "Şifre değiştirildi" }); setPasswords({ current: "", new: "", confirm: "" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Hata", description: e.message }),
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => { const res = await fetch(`/api/users/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast({ title: "Güncellendi" }); queryClient.invalidateQueries({ queryKey: ["users"] }); },
    onError: () => toast({ variant: "destructive", title: "Hata" }),
  });

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) { toast({ variant: "destructive", description: "Şifreler eşleşmiyor" }); return; }
    if (passwords.new.length < 6) { toast({ variant: "destructive", description: "Şifre en az 6 karakter" }); return; }
    passwordMutation.mutate();
  };

  const deleteBusinessMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch(`/api/business/${session?.user?.businessId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşletme silinemedi");
      return data;
    },
    onSuccess: async () => {
      toast({ title: "İşletme silindi", description: "Yönlendiriliyorsunuz..." });
      // Sign out and redirect to login
      await signOut({ redirect: false });
      // Force redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Hata", description: e.message });
      setDeletePassword("");
    },
  });

  const handleDeleteBusiness = () => {
    if (!deletePassword) {
      toast({ variant: "destructive", description: "Lütfen şifrenizi girin" });
      return;
    }
    deleteBusinessMutation.mutate(deletePassword);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="İşletme ve hesap ayarları" />
      
      {session?.user?.role === "ADMIN" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />İşletme Bilgileri</CardTitle></CardHeader><CardContent>
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2"><Label>İşletme Adı</Label><Input value={businessInfo.name || ""} onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adres</Label><Textarea value={businessInfo.address || ""} onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Telefon</Label><Input type="tel" value={businessInfo.phone || ""} onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>E-posta</Label><Input type="email" value={businessInfo.email || ""} onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Vergi No</Label><Input value={businessInfo.taxNumber || ""} onChange={(e) => setBusinessInfo({ ...businessInfo, taxNumber: e.target.value })} /></div>
            <div className="flex gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      {session?.user?.role === "ADMIN" && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Tehlikeli Bölge
            </CardTitle>
            <CardDescription className="text-red-600">
              İşletmeyi silmek tüm verileri kalıcı olarak silecektir. Bu işlem geri alınamaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              İşletmeyi Sil
            </Button>
          </CardContent>
        </Card>
      )}

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Şifre Değiştir</CardTitle></CardHeader><CardContent>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2"><Label>Mevcut Şifre</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></div>
          <div className="space-y-2"><Label>Yeni Şifre</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} /></div>
          <div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
          <Button onClick={handlePasswordChange} disabled={passwordMutation.isPending}>{passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Şifre Değiştir</Button>
        </div>
      </CardContent></Card>

      {session?.user?.role === "ADMIN" && usersData?.users && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Kullanıcı Yönetimi</CardTitle><CardDescription>Bu işletmedeki kullanıcılar</CardDescription></CardHeader><CardContent>
          <div className="space-y-4">
            {usersData.users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div>
                <div className="flex items-center gap-3">
                  {user.id === session.user.id ? <Badge>Siz</Badge> : (
                    <Select value={user.role} onValueChange={(role) => roleMutation.mutate({ userId: user.id, role })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="ADMIN">Yönetici</SelectItem><SelectItem value="STAFF">Personel</SelectItem></SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}

      {/* Delete Business Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              İşletmeyi Sil
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bu işlem <strong>geri alınamaz</strong>. İşletme ve tüm verileri (müşteriler, ürünler, siparişler) kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Silinecek Veriler:</p>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                <li>Tüm müşteriler</li>
                <li>Tüm ürünler ve stok bilgileri</li>
                <li>Tüm siparişler ve satış geçmişi</li>
                <li>İşletme bilgileri</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-sm font-semibold">
                Devam etmek için şifrenizi girin:
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deletePassword) {
                    handleDeleteBusiness();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePassword("");
              }}
              disabled={deleteBusinessMutation.isPending}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBusiness}
              disabled={deleteBusinessMutation.isPending || !deletePassword}
            >
              {deleteBusinessMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              İşletmeyi Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

