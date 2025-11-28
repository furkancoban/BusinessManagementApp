import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy", { locale: tr });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: tr });
}

export const paymentTypeLabels: Record<string, string> = {
  CASH: "Nakit",
  CARD: "Kart",
  TRANSFER: "Havale/EFT",
  VERESIYE: "Veresiye",
  OTHER: "Diğer",
};

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

