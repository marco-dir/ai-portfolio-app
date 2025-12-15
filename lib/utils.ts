import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}
