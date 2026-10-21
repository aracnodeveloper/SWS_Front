import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../shared/services/cart-store';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, Icon, MediaPipe, MoneyPipe],
  template: `
    @if (cart.drawerOpen()) {
      <div class="fixed inset-0 z-50 animate-fade-in bg-navy-950/40 backdrop-blur-sm" (click)="close()" aria-hidden="true"></div>
      <aside class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md animate-slide-in-right flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Carrito">
        <div class="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <h2 class="text-lg font-bold">Tu carrito <span class="text-sm font-medium text-slate-400">({{ cart.count() }})</span></h2>
          <button type="button" class="btn-ghost" (click)="close()" aria-label="Cerrar carrito"><app-icon name="close" /></button>
        </div>

        @if (cart.isEmpty()) {
          <div class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div class="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500"><app-icon name="cart" [size]="28" /></div>
            <p class="text-slate-500">Tu carrito está vacío.</p>
            <a routerLink="/catalogo" (click)="close()" class="btn-primary">Ver catálogo</a>
          </div>
        } @else {
          <ul class="flex-1 divide-y divide-brand-100 overflow-y-auto px-5">
            @for (item of cart.items(); track item.productId; let i = $index) {
              <li class="flex animate-fade-up gap-4 py-4" [style.animation-delay.ms]="150 + i * 60">
                <a [routerLink]="['/producto', item.slug]" (click)="close()" class="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-brand-50">
                  <img [src]="item.imageUrl | media" [alt]="item.name" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" />
                </a>
                <div class="flex flex-1 flex-col">
                  <a [routerLink]="['/producto', item.slug]" (click)="close()" class="line-clamp-2 text-sm font-semibold hover:text-brand-600">{{ item.name }}</a>
                  <span class="text-sm text-slate-500">{{ item.price | money }}</span>
                  <div class="mt-auto flex items-center justify-between pt-2">
                    <div class="flex items-center rounded-xl border border-brand-100">
                      <button type="button" class="grid size-8 place-items-center hover:text-brand-600" (click)="cart.setQuantity(item.productId, item.quantity - 1)" aria-label="Quitar uno"><app-icon name="minus" [size]="14" /></button>
                      <span class="w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
                      <button type="button" class="grid size-8 place-items-center hover:text-brand-600 disabled:opacity-30" [disabled]="item.quantity >= cart.limitFor(item.stock)" (click)="cart.setQuantity(item.productId, item.quantity + 1)" aria-label="Agregar uno"><app-icon name="plus" [size]="14" /></button>
                    </div>
                    <span class="font-semibold">{{ item.price * item.quantity | money: true }}</span>
                  </div>
                </div>
              </li>
            }
          </ul>
          <div class="space-y-3 border-t border-brand-100 p-5">
            <div class="flex justify-between text-base"><span class="font-semibold">Total</span><span class="text-xl font-bold">{{ cart.itemsTotal() | money: true }}</span></div>
            <p class="text-xs text-slate-400">IVA incluido. El envío se coordina al confirmar el pedido.</p>
            <button type="button" class="btn-primary w-full" (click)="go('/checkout')">Finalizar compra <app-icon name="arrow-right" [size]="18" /></button>
            <button type="button" class="btn-outline w-full" (click)="go('/carrito')">Ver carrito</button>
          </div>
        }
      </aside>
    }
  `,
  host: { '(document:keydown.escape)': 'close()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawer {
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);

  protected close(): void {
    this.cart.drawerOpen.set(false);
  }

  protected go(path: string): void {
    this.close();
    void this.router.navigateByUrl(path);
  }
}
