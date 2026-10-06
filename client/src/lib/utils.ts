import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Negotiable';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function buildWhatsAppBookingLink(
  phoneNumber: string,
  equipmentName: string,
  startDate: string,
  endDate: string,
  clientName: string,
  clientEmail: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = `Hello HLG Dispatch Team,\n\nI would like to book the following heavy machinery for an infrastructure project in/around Meru:\n\n🚜 Equipment: ${equipmentName}\n📅 Start Date: ${startDate}\n📅 End Date: ${endDate}\n👤 Client Name: ${clientName}\n✉️ Email: ${clientEmail}\n\nPlease provide quotation and confirmation details. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Robust API Base URL resolver.
 * Always resolves to relative '/api/v1' on client and serverless runtime,
 * strictly ignoring any obsolete localhost:5000 overrides.
 */
export const API_BASE_URL = '/api/v1';

export function getApiUrl(): string {
  return '/api/v1';
}

