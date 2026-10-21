import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Tienda pública: SSR (SEO + vista previa al compartir por WhatsApp).
 * Carrito, checkout, pago y admin: solo cliente (dependen de localStorage / sesión).
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'carrito', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'pago/**', renderMode: RenderMode.Client },
  { path: 'pedido/**', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
