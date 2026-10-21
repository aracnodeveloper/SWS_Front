export type PaymentMethod = 'payphone' | 'whatsapp';

export type OrderStatus =
  | 'pending_payment'
  | 'pending_confirmation'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'expired';

export interface StoreConfig {
  name: string;
  currency: string;
  vatRate: number;
  pricesIncludeVat: boolean;
  shippingCost: number;
  freeShippingFrom: number | null;
  whatsAppNumber: string;
  contactEmail: string;
  paymentMethods: PaymentMethod[];
}

export interface CheckoutRequest {
  customerName: string;
  email: string;
  phone: string;
  documentId: string;
  province: string;
  city: string;
  address: string;
  addressReference?: string | null;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  items: { productId: string; quantity: number }[];
}

export interface CheckoutResponse {
  orderCode: string;
  publicToken: string;
  paymentMethod: PaymentMethod;
  total: number;
  redirectUrl: string | null;
  whatsAppUrl: string | null;
}

export interface PublicOrderItem {
  productName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PublicOrder {
  code: string;
  publicToken: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  email: string;
  city: string;
  itemsTotal: number;
  shipping: number;
  subtotal: number;
  vat: number;
  total: number;
  createdAt: string;
  paidAt: string | null;
  whatsAppUrl: string | null;
  items: PublicOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  number: number;
  code: string;
  publicToken: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  email: string;
  phone: string;
  documentId: string;
  province: string;
  city: string;
  address: string;
  addressReference: string | null;
  notes: string | null;
  itemsTotal: number;
  shipping: number;
  subtotal: number;
  vat: number;
  total: number;
  expiresAt: string | null;
  paidAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminTransaction {
  id: string;
  gateway: string;
  status: string;
  amount: number;
  authorizationCode: string | null;
  cardBrand: string | null;
  lastDigits: string | null;
  message: string | null;
  createdAt: string;
}
