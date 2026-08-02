import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#SK-${num}`;
}
