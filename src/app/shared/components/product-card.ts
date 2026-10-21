import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../models/catalog';
import { MediaPipe } from '../pipes/media';
import { MoneyPipe } from '../pipes/money';
import { CartStore } from '../services/cart-store';
import { ToastService } from '../services/toast';
import { Icon } from './icon';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgOptimizedImage, MoneyPipe, MediaPipe, Icon],
  template: `
    @let p = product();
    <article class="group card relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/15">
      <a [routerLink]="['/producto', p.slug]" class="relative block aspect-square overflow-hidden bg-brand-50/60">
        <img
          [ngSrc]="p.imageUrl | media"
          [alt]="p.name"
          fill
          [priority]="priority()"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          class="object-cover transition duration-700 group-hover:scale-110"
        />
        @if (p.badge) {
          <span class="absolute left-3 top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow">{{ p.badge }}</span>
        }
        @if (soldOut()) {
          <span class="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold uppercase tracking-widest text-navy-900">Agotado</span>
        } @else if (p.stock <= 3) {
          <span class="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">¡Quedan {{ p.stock }}!</span>
        }
      </a>
      <div class="flex flex-1 flex-col gap-2 p-4">
        @if (p.category) {
          <span class="text-[11px] font-semibold uppercase tracking-wider text-brand-500">{{ p.category.name }}</span>
        }
        <a [routerLink]="['/producto', p.slug]" class="line-clamp-2 font-semibold leading-snug text-navy-900 hover:text-brand-600">{{ p.name }}</a>
        <div class="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            @if (p.compareAtPrice && p.compareAtPrice > p.price) {
              <span class="block text-xs text-slate-400 line-through">{{ p.compareAtPrice | money }}</span>
            }
            <span class="text-xl font-bold text-navy-900">{{ p.price | money }}</span>
          </div>
          <button
            type="button"
            class="grid size-11 place-items-center rounded-xl bg-navy-900 text-white transition duration-300 group-hover:bg-brand-500 hover:-rotate-6 hover:scale-110 active:scale-90 disabled:bg-slate-300"
            [disabled]="soldOut()"
            (click)="add()"
            [attr.aria-label]="'Agregar ' + p.name + ' al carrito'"
          >
            <app-icon name="cart" [size]="18" />
          </button>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly priority = input(false);

  private readonly cart = inject(CartStore);
  private readonly toast = inject(ToastService);

  protected readonly soldOut = computed(() => this.product().stock <= 0);

  protected add(): void {
    this.cart.add(this.product());
    this.toast.success(`${this.product().name} agregado al carrito`);
  }
}
