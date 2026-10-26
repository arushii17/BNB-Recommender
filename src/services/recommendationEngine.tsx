import type { Currency, PlatformType } from '@/types/stay';
import { CURRENCY_SYMBOLS } from './currency';

export function calculateNights(checkIn: string, checkOut: string): number {
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  } catch {
    return 1;
  }
}

export function formatPrice(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

export function platformDisplayName(platform: PlatformType | string): string {
  const names: Record<string, string> = {
    airbnb: 'Airbnb',
    booking: 'Booking.com',
    vrbo: 'Vrbo',
    google: 'Google Hotels',
    expedia: 'Expedia',
  };
  return names[platform.toLowerCase()] || platform;
}

export function platformBadgeColor(platform: PlatformType | string): { bg: string; text: string; border: string } {
  switch (platform.toLowerCase()) {
    case 'airbnb':
      return { bg: 'bg-[#FF5A5F]/10', text: 'text-[#FF5A5F]', border: 'border-[#FF5A5F]' };
    case 'booking':
      return { bg: 'bg-[#003580]/15', text: 'text-[#003580] dark:text-[#29ADFF]', border: 'border-[#003580]' };
    case 'vrbo':
      return { bg: 'bg-[#1C4382]/15', text: 'text-[#1C4382] dark:text-[#29ADFF]', border: 'border-[#1C4382]' };
    case 'google':
      return { bg: 'bg-[#4285F4]/15', text: 'text-[#4285F4]', border: 'border-[#4285F4]' };
    case 'expedia':
      return { bg: 'bg-[#FFCC00]/20', text: 'text-[#B8860B] dark:text-[#FFEC27]', border: 'border-[#FFCC00]' };
    default:
      return { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' };
  }
}
