"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Phone, Mail, ShoppingBag, TrendingUp, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

async function fetchCustomers(search: string) {
  const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Müşteriler"
        description={`${data?.pagination?.total || 0} kayıtlı müşteri`}
        actions={
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-sm">
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Müşteri</span>
              <span className="sm:hidden">Yeni</span>
            </Link>
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Müşteri ara... (isim, telefon, email)"
          className="pl-10 h-10 sm:h-11 bg-white shadow-sm text-sm"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-blue-100">Toplam Müşteri</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">{data?.pagination?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-emerald-100">Aktif Müşteri</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">{data?.customers?.length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white h-full">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-purple-100">Sipariş Veren</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
                  {data?.customers?.filter((c: any) => c._count?.orders > 0).length || 0}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-purple-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Grid */}
      {data?.customers?.length ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.customers.map((customer: any) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 sm:p-4 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base sm:text-lg shadow-lg shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                            {customer.name}
                          </h3>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {customer._count?.orders || 0} sipariş
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {/* Last Order */}
                    {customer.orders?.[0] && (
                      <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Son Sipariş</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm truncate">{formatDate(customer.orders[0].orderDate)}</span>
                          <span className="font-semibold text-primary text-sm sm:text-base shrink-0">
                            {formatCurrency(customer.orders[0].totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Müşteri bulunamadı"
          description={search ? "Arama kriterlerine uygun müşteri yok" : "Henüz müşteri eklenmemiş"}
          action={
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Link href="/customers/new">
                <Plus className="mr-2 h-4 w-4" />
                İlk Müşteriyi Ekle
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
