import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartStore } from '../../shared/services/cart-store';
import { OrderApi } from '../../shared/services/order-api';
import { CartSummary } from '../../shared/components/cart-summary';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';
import { estimateTotals } from '../../shared/utils/pricing';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CartSummary, Icon, MediaPipe, MoneyPipe],
  template: `
    <div class="container-page py-10">
      <h1 class="section-title">Tu carrito</h1>
      <div class="section-bar"></div>

      @if (cart.isEmpty()) {
        <div class="mt-10 rounded-3xl border border-dashed border-brand-200 p-14 text-center">
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500"><app-icon name="cart" [size]="28" /></div>
          <p class="mt-4 font-semibold">Tu carrito está vacío</p>
          <a routerLink="/catalogo" class="btn-primary mt-6">Ver catálogo</a>
        </div>
      } @else {
        <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <ul class="card divide-y divide-brand-100">
            @for (item of cart.items(); track item.productId) {
              <li class="flex gap-4 p-4 sm:p-5">
                <a [routerLink]="['/producto', item.slug]" class="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-brand-50 sm:size-28">
                  <img [src]="item.imageUrl | media" [alt]="item.name" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" />
                </a>
                <div class="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                  <div class="flex-1">
                    <a [routerLink]="['/producto', item.slug]" class="font-semibold hover:text-brand-600">{{ item.name }}</a>
                    <p class="text-sm text-slate-500">{{ item.price | money }} c/u</p>
                  </div>
                  <div class="flex items-center justify-between gap-6">
                    <div class="flex items-center rounded-xl border border-brand-100">
                      <button type="button" class="grid size-10 place-items-center hover:text-brand-600" (click)="cart.setQuantity(item.productId, item.quantity - 1)" aria-label="Quitar uno"><app-icon name="minus" [size]="14" /></button>
                      <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                      <button type="button" class="grid size-10 place-items-center hover:text-brand-600 disabled:opacity-30" [disabled]="item.quantity >= cart.limitFor(item.stock)" (click)="cart.setQuantity(item.productId, item.quantity + 1)" aria-label="Agregar uno"><app-icon name="plus" [size]="14" /></button>
                    </div>
                    <span class="w-24 text-right font-bold">{{ item.price * item.quantity | money: true }}</span>
                    <button type="button" class="text-slate-400 hover:text-red-600" (click)="cart.remove(item.productId)" [attr.aria-label]="'Quitar ' + item.name"><app-icon name="trash" [size]="18" /></button>
                  </div>
                </div>
              </li>
            }
          </ul>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="text-lg font-bold">Resumen</h2>
            <div class="mt-4"><app-cart-summary [totals]="totals()" [vatIncluded]="config()?.pricesIncludeVat ?? true" /></div>
            <a routerLink="/checkout" class="btn-primary mt-6 w-full">Finalizar compra <app-icon name="arrow-right" [size]="18" /></a>
            <a routerLink="/catalogo" class="btn-ghost mt-2 w-full">Seguir comprando</a>
          </aside>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly config = toSignal(inject(OrderApi).config(), { initialValue: null });
  protected readonly totals = computed(() => estimateTotals(this.cart.itemsTotal(), this.config()));
}
