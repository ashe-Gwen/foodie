const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatPrice(pence: number): string {
  return formatter.format(pence / 100);
}

export function discountedPrice(pence: number, percent: number): number {
  return Math.round(pence * (1 - percent / 100));
}
