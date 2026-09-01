export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function resolveInitialLocale(value: string | null | undefined): Locale {
  return value === 'en' ? 'en' : 'vi';
}

export function formatCurrency(value: number, locale: Locale): string {
  const languageTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.NumberFormat(languageTag, {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function formatDate(value: Date, locale: Locale): string {
  const languageTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(languageTag, {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
  }).format(value);
}

export function formatDateTime(value: Date | string, locale: Locale): string {
  const languageTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(languageTag, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
  }).format(typeof value === 'string' ? new Date(value) : value);
}
