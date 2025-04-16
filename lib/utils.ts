import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number | string, currency: string = 'USD', showSymbol: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(numAmount);
  return showSymbol ? formatted : formatted.replace(/[^0-9.-]+/g, '');
}

export function getCurrencySymbol(currency: string = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);
  
  return formatted.replace(/[\d.,\s]/g, '');
}