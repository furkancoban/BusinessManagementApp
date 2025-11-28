"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Loading } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, paymentTypeLabels, orderStatusLabels } from "@/lib/utils";

async function fetchOrders() {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const paymentIcons: Record<string, any> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: ArrowUpRight,
  VERESIYE: Receipt,
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  if (isLoading) return <Loading />;

  const totalAmount = data?.orders?.reduce((sum: number, o: any) => sum + o.totalAmount, 0) || 0;
  const completedOrders = data?.orders?.filter((o: any) => o.status === "COMPLETED").length || 0;
  const todayOrders = data?.orders?.filter((o: any) => {
    const orderDate = new Date(o.orderDate);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;
  const unpaidVeresiye = data?.orders?.filter((o: any) => o.paymentType === "VERESIYE") || [];
  const unpaidVeresiyeAmount = unpaidVeresiye.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Siparişler"
        description={`${data?.pagination?.total || 0} sipariş kaydı`}
        actions={
          <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg text-sm">
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Sipariş</span>
              <span className="sm:hidden">Yeni</span>
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-100">Toplam Sipariş</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 break-words">{data?.pagination?.total || 0}</p>
              </div>
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-emerald-100">Toplam Satış</p>
                <p className={`font-bold mt-1 break-words leading-tight ${
                  totalAmount >= 1000000
                    ? "text-xs sm:text-sm lg:text-base"
                    : totalAmount >= 100000
                    ? "text-sm sm:text-base lg:text-lg"
                    : totalAmount >= 10000
                    ? "text-base sm:text-lg lg:text-xl"
                    : "text-lg sm:text-xl lg:text-2xl"
                }`}>
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-emerald-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-purple-100">Tamamlanan</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 break-words">{completedOrders}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-purple-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white h-full">
          <CardContent className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-100">Bugün</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 break-words">{todayOrders}</p>
              </div>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-amber-200 shrink-0" />
            </div>
          </CardContent>
        </Card>
        {unpaidVeresiye.length > 0 && (
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white h-full border-2 border-orange-300 col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-orange-100">Ödenmemiş Veresiye</p>
                  <p className={`font-bold mt-1 break-words leading-tight ${
                    unpaidVeresiyeAmount >= 1000000
                      ? "text-xs sm:text-sm lg:text-base"
                      : unpaidVeresiyeAmount >= 100000
                      ? "text-sm sm:text-base lg:text-lg"
                      : unpaidVeresiyeAmount >= 10000
                      ? "text-base sm:text-lg lg:text-xl"
                      : "text-lg sm:text-xl lg:text-2xl"
                  }`}>
                    {formatCurrency(unpaidVeresiyeAmount)}
                  </p>
                  <p className="text-xs text-orange-100 mt-1">{unpaidVeresiye.length} sipariş</p>
                </div>
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-orange-200 shrink-0" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Orders List */}
      {data?.orders?.length ? (
        <div className="space-y-3 sm:space-y-4">
          {data.orders.map((order: any) => {
            const PaymentIcon = paymentIcons[order.paymentType] || Banknote;
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${
                  order.paymentType === "VERESIYE" ? "border-2 border-amber-200 bg-amber-50/30" : ""
                }`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                      {/* Left section */}
                      <div className="flex-1 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0 lg:min-h-[100px]">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0 shadow-lg">
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-sm sm:text-base lg:text-lg group-hover:text-primary transition-colors truncate min-w-0">
                              {order.orderNumber}
                            </h3>
                            <Badge
                              variant={order.status === "COMPLETED" ? "default" : "secondary"}
                              className={`text-[10px] sm:text-xs shrink-0 px-1.5 py-0.5 ${
                                order.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : ""
                              }`}
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              {orderStatusLabels[order.status]}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground font-medium text-xs sm:text-sm lg:text-base truncate mb-0.5">
                            {order.customer?.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {formatDateTime(order.orderDate)}
                          </p>
                        </div>
                      </div>

                      {/* Middle section - items */}
                      <div className="px-4 sm:px-5 py-3 lg:py-5 border-t lg:border-t-0 lg:border-l bg-slate-50/50 lg:w-[180px] lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center">
                        <p className="text-xs text-muted-foreground mb-1.5 lg:mb-2">Ürünler</p>
                        <div className="flex flex-wrap gap-1 min-h-[32px] lg:min-h-[40px] items-start">
                          {order.items?.slice(0, 2).map((item: any, idx: number) => {
                            const productName = item.product?.name || "";
                            const maxNameLength = 8;
                            const displayName = productName.length > maxNameLength 
                              ? productName.slice(0, maxNameLength) + "..." 
                              : productName;
                            const quantity = item.quantity;
                            const quantityStr = quantity >= 1000 
                              ? `${(quantity / 1000).toFixed(quantity % 1000 === 0 ? 0 : 1)}k`
                              : quantity.toString();
                            return (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                                {displayName} x{quantityStr}
                              </Badge>
                            );
                          })}
                          {order.items?.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                              +{order.items.length - 2}
                            </Badge>
                          )}
                          {(!order.items || order.items.length === 0) && (
                            <span className="text-[10px] text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>

                      {/* Right section */}
                      <div className={`px-4 sm:px-5 py-4 lg:py-5 border-t lg:border-t-0 lg:border-l lg:w-[200px] xl:w-[220px] lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center text-right ${
                        order.paymentType === "VERESIYE" 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" 
                          : "bg-gradient-to-r from-slate-50 to-white"
                      }`}>
                        <p className={`font-bold whitespace-nowrap leading-tight mb-2 overflow-hidden text-ellipsis ${
                          order.paymentType === "VERESIYE" ? "text-amber-700" : "text-primary"
                        } ${
                          order.totalAmount >= 1000000
                            ? "text-xs sm:text-sm lg:text-base"
                            : order.totalAmount >= 100000
                            ? "text-sm sm:text-base lg:text-lg"
                            : order.totalAmount >= 10000
                            ? "text-base sm:text-lg lg:text-xl"
                            : "text-lg sm:text-xl lg:text-2xl"
                        }`}>
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
                          <PaymentIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 ${
                            order.paymentType === "VERESIYE" ? "text-amber-600" : "text-muted-foreground"
                          }`} />
                          <span className={`text-[10px] sm:text-xs truncate ${
                            order.paymentType === "VERESIYE" ? "text-amber-700 font-semibold" : "text-muted-foreground"
                          }`}>
                            {paymentTypeLabels[order.paymentType]}
                          </span>
                          {order.paymentType === "VERESIYE" && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-100 whitespace-nowrap">
                              Ödenmedi
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Sipariş bulunamadı"
          description="Henüz sipariş oluşturulmamış"
          action={
            <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600">
              <Link href="/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                İlk Siparişi Oluştur
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
