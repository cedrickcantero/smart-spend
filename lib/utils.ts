import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useAuth } from "./auth-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number | string, currency: string = 'USD', showSymbol: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const {userSettings} = useAuth();

  const settingsObj = userSettings as Record<string, any> || {};
  const userCurrency = settingsObj.preferences?.currency || currency;
  
  if (isNaN(numAmount)) return '0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: userCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(numAmount);
  return showSymbol ? formatted : formatted.replace(/[^0-9.-]+/g, '');
}

