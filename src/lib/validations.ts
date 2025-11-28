import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export const customerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  purchasePrice: z.number().min(0, "Alış fiyatı 0 veya daha büyük olmalıdır"),
  sellPrice: z.number().min(0, "Satış fiyatı 0 veya daha büyük olmalıdır"),
  stockQuantity: z.number().int().min(0, "Stok miktarı 0 veya daha büyük olmalıdır"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;

