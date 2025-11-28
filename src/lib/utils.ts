import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  return phone;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `SIP-${year}-${random}`;
}

export function calculateProfit(sellPrice: number, purchasePrice: number): number {
  return sellPrice - purchasePrice;
}

export function calculateProfitMargin(sellPrice: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0;
  return ((sellPrice - purchasePrice) / purchasePrice) * 100;
}

export const paymentTypeLabels: Record<string, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale/EFT",
  VERESIYE: "Veresiye",
  OTHER: "Diğer",
};

export const paymentTypeColors: Record<string, string> = {
  CASH: "bg-green-100 text-green-800 border-green-200",
  CREDIT_CARD: "bg-blue-100 text-blue-800 border-blue-200",
  BANK_TRANSFER: "bg-purple-100 text-purple-800 border-purple-200",
  VERESIYE: "bg-orange-100 text-orange-800 border-orange-200",
  OTHER: "bg-gray-100 text-gray-800 border-gray-200",
};

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export const orderStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

