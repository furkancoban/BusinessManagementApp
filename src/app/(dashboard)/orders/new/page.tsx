"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Minus,
  X,
  Search,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  defaultPrice: number;
}

async function fetchCustomers() {
  const res = await fetch("/api/customers?limit=100");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function fetchProducts() {
  const res = await fetch("/api/products?limit=100");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function createOrder(data: any) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create order");
  }
  return res.json();
}

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
  const [paymentType, setPaymentType] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const { data: customersData } = useQuery({
    queryKey: ["customers-select"],
    queryFn: fetchCustomers,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-select"],
    queryFn: fetchProducts,
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast({
        title: "Başarılı",
        description: "Sipariş başarıyla oluşturuldu.",
      });
      router.push(`/orders/${order.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Sipariş oluşturulurken bir hata oluştu.",
      });
    },
  });

  const customers = customersData?.customers || [];
  const products = productsData?.products || [];

  const selectedCustomer = customers.find((c: any) => c.id === customerId);

  const filteredCustomers = customers.filter((c: any) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: any) => {
    const existingItem = items.find((item) => item.productId === product.id);
    
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellPrice,
          defaultPrice: product.sellPrice,
        },
      ]);
    }
    setShowProductDialog(false);
    setProductSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, unitPrice: price } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = () => {
    if (!customerId) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir müşteri seçin.",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir ürün ekleyin.",
      });
      return;
    }

    mutation.mutate({
      customerId,
      paymentType,
      notes: notes || null,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni Sipariş"
        description="Yeni sipariş oluşturun"
        actions={
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Geri
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">1. Müşteri Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant={selectedCustomer ? "outline" : "default"}
                    className="w-full h-14 justify-start text-left"
                  >
                    {selectedCustomer ? (
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{selectedCustomer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5" />
                        <span>Müşteri seçin...</span>
                      </div>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Müşteri Seç</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Müşteri ara (ad, telefon)..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {filteredCustomers.map((customer: any) => (
                        <button
                          key={customer.id}
                          className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors"
                          onClick={() => {
                            setCustomerId(customer.id);
                            setShowCustomerDialog(false);
                            setCustomerSearch("");
                          }}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone}
                          </p>
                        </button>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <p className="text-center py-4 text-muted-foreground">
                          Müşteri bulunamadı
                        </p>
                      )}
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/customers/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Müşteri Ekle
                      </Link>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">2. Ürün Ekleme</CardTitle>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-5 w-5" />
                    Ürün Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ürün Seç</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Ürün ara (ad, SKU)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {filteredProducts.map((product: any) => (
                        <button
                          key={product.id}
                          className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && (
                                <p className="text-sm text-muted-foreground">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                            <p className="font-semibold">
                              {formatCurrency(product.sellPrice)}
                            </p>
                          </div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-center py-4 text-muted-foreground">
                          Ürün bulunamadı
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz ürün eklenmedi. Yukarıdaki butona tıklayarak ürün ekleyin.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        {item.unitPrice !== item.defaultPrice && (
                          <p className="text-sm text-orange-600">
                            Varsayılan: {formatCurrency(item.defaultPrice)}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updatePrice(item.productId, parseFloat(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="w-28 text-right font-semibold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">3. Ödeme Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ödeme Tipi</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { value: "CASH", label: "Nakit", icon: "💵" },
                    { value: "CREDIT_CARD", label: "Kredi Kartı", icon: "💳" },
                    { value: "BANK_TRANSFER", label: "Havale/EFT", icon: "🏦" },
                    { value: "VERESIYE", label: "Veresiye", icon: "📝" },
                    { value: "OTHER", label: "Diğer", icon: "📌" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={paymentType === type.value ? "default" : "outline"}
                      className={`h-12 ${paymentType === type.value && type.value === "VERESIYE" ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                      onClick={() => setPaymentType(type.value)}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Sipariş hakkında notlar..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Müşteri</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Toplam</span>
                  <span className="text-3xl font-bold">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg"
                disabled={!customerId || items.length === 0 || mutation.isPending}
                onClick={handleSubmit}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Siparişi Oluştur"
                )}
              </Button>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/orders">İptal</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

