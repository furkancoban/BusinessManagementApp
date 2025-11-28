import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().min(0, "Alış fiyatı 0'dan küçük olamaz"),
  sellPrice: z.coerce.number().min(0, "Satış fiyatı 0'dan küçük olamaz"),
  stockQuantity: z.coerce.number().int().min(0, "Stok miktarı 0'dan küçük olamaz").default(0),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Ürün seçiniz"),
  quantity: z.coerce.number().int().min(1, "Miktar en az 1 olmalıdır"),
  unitPrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçiniz"),
  paymentType: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER", "VERESIYE", "OTHER"]),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "En az bir ürün ekleyiniz"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

