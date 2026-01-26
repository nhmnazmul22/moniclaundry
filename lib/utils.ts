import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrderStatusColor(status: string) {
  const colors: { [key: string]: string } = {
    diterima: "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800",
    diproses:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800",
    selesai:
      "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function generateOrderNumber(code: string) {
  const orderNumber = `${code}${new Date().getMilliseconds().toFixed()}${Number(
    Math.random() * 99
  ).toFixed()}`;
  console.log(orderNumber);
  console.log(new Date().getMilliseconds().toFixed());
  return orderNumber;
}

export function calculateEstimatedCompletion(hours: number): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function getPaymentStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    "belum lunas": "bg-yellow-100 text-yellow-800",
    lunas: "bg-green-100 text-green-800",
    dp: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export class TimeoutError extends Error {
  constructor(message = "Query timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError()), timeoutMs)
    ),
  ]);
}
