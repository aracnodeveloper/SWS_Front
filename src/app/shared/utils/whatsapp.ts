import { STORE } from '../config/store';

export function whatsAppUrl(message: string, phone: string = STORE.whatsAppNumber): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
