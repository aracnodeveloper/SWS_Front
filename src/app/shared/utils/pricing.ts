import { StoreConfig } from '../models/order';

export interface Totals {
  itemsTotal: number;
  shipping: number;
  subtotal: number;
  vat: number;
  total: number;
}

/** Estimado para mostrar en carrito/checkout. El total real lo calcula el API (OrderPricing). */
export function estimateTotals(itemsTotal: number, cfg: StoreConfig | null): Totals {
  const rate = cfg?.vatRate ?? 0.15;
  const free = cfg?.freeShippingFrom;
  const shipping = free != null && itemsTotal >= free ? 0 : cfg?.shippingCost ?? 0;
  const round = (n: number) => Math.round(n * 100) / 100;

  if (cfg?.pricesIncludeVat ?? true) {
    const total = round(itemsTotal + shipping);
    const subtotal = round(total / (1 + rate));
    return { itemsTotal, shipping, subtotal, vat: round(total - subtotal), total };
  }
  const subtotal = round(itemsTotal + shipping);
  const vat = round(subtotal * rate);
  return { itemsTotal, shipping, subtotal, vat, total: round(subtotal + vat) };
}
