"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, Building2, User, Lock, Users, Shield, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface BusinessFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function updateSettings(data: BusinessFormData) {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

async function fetchUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function updateUser(id: string, data: { role?: string; isActive?: boolean }) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update user");
  }
  return res.json();
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete user");
  }
  return res.json();
}

async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to change password");
  }
  return res.json();
}

async function deleteBusiness(businessId: string, password: string) {
  const res = await fetch(`/api/business/${businessId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete business");
  }
  return res.json();
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteBusinessDialog, setShowDeleteBusinessDialog] = useState(false);
  const [deleteBusinessPassword, setDeleteBusinessPassword] = useState("");
  const [deleteBusinessError, setDeleteBusinessError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: isAdmin,
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<BusinessFormData>();
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm<PasswordFormData>();

  useEffect(() => {
    if (data?.businessInfo) {
      reset({
        name: data.businessInfo.name || "",
        address: data.businessInfo.address || "",
        phone: data.businessInfo.phone || "",
        email: data.businessInfo.email || "",
        taxNumber: data.businessInfo.taxNumber || "",
      });
    }
  }, [data, reset]);

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      // Refresh session to update business name
      window.location.reload();
      toast({
        title: "Başarılı",
        description: "İşletme bilgileri güncellendi.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bilgiler güncellenirken bir hata oluştu.",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Şifreniz değiştirildi.",
      });
      resetPassword();
      setShowPasswordForm(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const userUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; isActive?: boolean } }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı güncellendi.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const userDeleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi.",
      });
      setDeleteUserId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const businessDeleteMutation = useMutation({
    mutationFn: ({ businessId, password }: { businessId: string; password: string }) =>
      deleteBusiness(businessId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast({
        title: "Başarılı",
        description: "İşletme silindi. Yeni bir işletme oluşturmak için yönlendiriliyorsunuz.",
      });
      setShowDeleteBusinessDialog(false);
      setDeleteBusinessPassword("");
      setDeleteBusinessError(null);
      // Redirect to business switcher or setup page
      window.location.href = "/setup";
    },
    onError: (error: Error) => {
      setDeleteBusinessError(error.message);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    settingsMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
      });
      return;
    }
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    userUpdateMutation.mutate({ id: userId, data: { role: newRole } });
  };

  if (isLoading) {
    return <Loading />;
  }

  const users: UserData[] = usersData?.users || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        description="İşletme bilgileri ve hesap ayarları"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              İşletme Bilgileri
            </CardTitle>
            <CardDescription>
              Bu bilgiler fişlerde ve raporlarda görünür
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">İşletme Adı</Label>
                <Input
                  id="name"
                  placeholder="İşletme adı"
                  {...register("name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  placeholder="İşletme adresi"
                  {...register("address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0212 123 4567"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@isletme.com"
                  {...register("email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">Vergi Numarası</Label>
                <Input
                  id="taxNumber"
                  placeholder="1234567890"
                  {...register("taxNumber")}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={settingsMutation.isPending || !isDirty}>
                  {settingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    "Değişiklikleri Kaydet"
                  )}
                </Button>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteBusinessDialog(true)}
                    className="ml-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    İşletmeyi Sil
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Hesap Bilgileri
            </CardTitle>
            <CardDescription>
              Giriş yapan kullanıcı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={session?.user?.name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input value={session?.user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={session?.user?.role === "ADMIN" ? "Yönetici" : "Personel"}
                  disabled
                  className="flex-1"
                />
                {isAdmin && (
                  <Badge variant="default" className="bg-green-600">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Şifre Değiştir
                </Label>
                {!showPasswordForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Şifreyi Değiştir
                  </Button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword("currentPassword", { required: "Mevcut şifre gereklidir" })}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="En az 6 karakter"
                      {...registerPassword("newPassword", { 
                        required: "Yeni şifre gereklidir",
                        minLength: { value: 6, message: "Şifre en az 6 karakter olmalıdır" }
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword("confirmPassword", { 
                        required: "Şifre tekrarı gereklidir",
                        validate: (value) => value === watchPassword("newPassword") || "Şifreler eşleşmiyor"
                      })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={passwordMutation.isPending}
                    >
                      {passwordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        "Şifreyi Kaydet"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPassword();
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management - Only for Admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcı Yönetimi
            </CardTitle>
            <CardDescription>
              Sistem kullanıcılarını yönetin ve rol atayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {user.role === "ADMIN" ? (
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Kayıt: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {user.id === session?.user?.id ? (
                        <Badge variant="secondary">Siz</Badge>
                      ) : (
                        <>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={userUpdateMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4" />
                                  Yönetici
                                </div>
                              </SelectItem>
                              <SelectItem value="STAFF">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Personel
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Kullanıcı bulunamadı
              </p>
            )}

            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 İpucu:</strong> Yeni kullanıcılar giriş sayfasındaki "Kayıt Ol" sekmesinden
                hesap oluşturabilir. Yeni hesaplar varsayılan olarak "Personel" rolü ile oluşturulur.
                Yönetici yapmak için yukarıdan rolünü değiştirin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versiyon</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dil</p>
              <p className="font-medium">Türkçe</p>
            </div>
            <div>
              <p className="text-muted-foreground">Veritabanı</p>
              <p className="font-medium">SQLite</p>
            </div>
            <div>
              <p className="text-muted-foreground">Framework</p>
              <p className="font-medium">Next.js 14</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
        title="Kullanıcıyı Sil"
        description="Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="destructive"
        onConfirm={() => deleteUserId && userDeleteMutation.mutate(deleteUserId)}
      />

      {/* Delete Business Dialog - Custom implementation */}
      {showDeleteBusinessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-destructive">İşletmeyi Sil</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Bu işletmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm işletme verileri (müşteriler, ürünler, siparişler) kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Güvenlik için şifrenizi girin:</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="••••••••"
                value={deleteBusinessPassword}
                onChange={(e) => setDeleteBusinessPassword(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deleteBusinessPassword && !businessDeleteMutation.isPending) {
                    if (session?.user?.businessId) {
                      businessDeleteMutation.mutate({
                        businessId: session.user.businessId,
                        password: deleteBusinessPassword,
                      });
                    }
                  }
                }}
              />
              {deleteBusinessError && (
                <p className="text-sm text-destructive mt-2">{deleteBusinessError}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ Son işletmenizi silemezsiniz. En az bir işletmeniz kalmalıdır.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteBusinessDialog(false);
                  setDeleteBusinessPassword("");
                  setDeleteBusinessError(null);
                }}
                disabled={businessDeleteMutation.isPending}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!deleteBusinessPassword) {
                    toast({
                      variant: "destructive",
                      title: "Hata",
                      description: "Lütfen şifrenizi girin.",
                    });
                    return;
                  }
                  if (session?.user?.businessId) {
                    businessDeleteMutation.mutate({
                      businessId: session.user.businessId,
                      password: deleteBusinessPassword,
                    });
                  }
                }}
                disabled={!deleteBusinessPassword || businessDeleteMutation.isPending}
              >
                {businessDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    İşletmeyi Sil
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
