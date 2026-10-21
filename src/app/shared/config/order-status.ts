import { OrderStatus } from '../models/order';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Esperando pago',
  pending_confirmation: 'Por confirmar (WhatsApp)',
  paid: 'Pagado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-700',
  pending_confirmation: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  preparing: 'bg-brand-50 text-brand-700',
  shipped: 'bg-brand-50 text-brand-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
};

/** Espejo de OrderStatus.AllowedTransitions del backend (el API valida igual). */
export const ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ['paid', 'cancelled'],
  pending_confirmation: ['paid', 'cancelled'],
  paid: ['preparing', 'shipped', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
};
