export function formatCurrencyVND(amount: number, locale: string = 'vi-VN') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(num: number, locale: string = 'vi-VN') {
  return new Intl.NumberFormat(locale).format(num);
}

