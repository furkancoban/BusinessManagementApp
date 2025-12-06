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
  stockQuantity: number;
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
    if (product.stockQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Stokta Yok",
        description: `${product.name} ürünü stokta bulunmuyor.`,
      });
      return;
    }

    const existingItem = items.find((item) => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stockQuantity) {
        toast({
          variant: "destructive",
          title: "Yetersiz Stok",
          description: `${product.name} ürününden stokta sadece ${product.stockQuantity} adet bulunmaktadır.`,
        });
        return;
      }
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
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
          stockQuantity: product.stockQuantity,
        },
      ]);
    }
    setShowProductDialog(false);
    setProductSearch("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 0) {
      return;
    }

    if (newQuantity > item.stockQuantity) {
      toast({
        variant: "destructive",
        title: "Yetersiz Stok",
        description: `${item.productName} ürününden stokta sadece ${item.stockQuantity} adet bulunmaktadır.`,
      });
      return;
    }

    setItems(
      items
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: newQuantity }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const setQuantity = (productId: string, quantity: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    // Allow empty string for clearing the field
    if (quantity === "" || quantity === "-") {
      // Don't update state, but allow user to type
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    
    // If not a valid number, don't update
    if (isNaN(numQuantity)) {
      return;
    }

    // Allow typing any number, but clamp to valid range
    // We'll validate properly on blur
    const clampedQuantity = Math.max(1, Math.min(numQuantity, item.stockQuantity));

    setItems(
      items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: clampedQuantity }
          : i
      )
    );
  };

  const handleQuantityBlur = (productId: string, quantity: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    // If field is empty or invalid, restore to current quantity
    if (quantity === "" || isNaN(parseInt(quantity, 10))) {
      // Force re-render with current quantity
      setItems([...items]);
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    
    // Ensure minimum of 1
    if (numQuantity < 1) {
      setItems(
        items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: 1 }
            : i
        )
      );
      return;
    }

    // Clamp to stock quantity
    const finalQuantity = Math.min(numQuantity, item.stockQuantity);
    if (finalQuantity !== numQuantity) {
      toast({
        variant: "destructive",
        title: "Yetersiz Stok",
        description: `${item.productName} ürününden stokta sadece ${item.stockQuantity} adet bulunmaktadır.`,
      });
    }

    setItems(
      items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: finalQuantity }
          : i
      )
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
                          className={`w-full p-3 text-left rounded-lg transition-colors ${
                            product.stockQuantity <= 0
                              ? "opacity-50 cursor-not-allowed bg-muted"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => addProduct(product)}
                          disabled={product.stockQuantity <= 0}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {product.sku && (
                                  <p className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                  </p>
                                )}
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    product.stockQuantity <= 0
                                      ? "bg-red-100 text-red-800"
                                      : product.stockQuantity < 10
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  Stok: {product.stockQuantity}
                                </span>
                              </div>
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
                        <div className="flex flex-col items-center gap-1">
                          <Input
                            type="number"
                            min="1"
                            max={item.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => setQuantity(item.productId, e.target.value)}
                            onBlur={(e) => handleQuantityBlur(item.productId, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-16 text-center font-semibold h-10 p-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            / {item.stockQuantity}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(item.productId, 1)}
                          disabled={item.quantity >= item.stockQuantity}
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

