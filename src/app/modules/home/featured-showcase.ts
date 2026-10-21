import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../shared/models/catalog';
import { CartStore } from '../../shared/services/cart-store';
import { ToastService } from '../../shared/services/toast';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';
import { Reveal } from '../../shared/directives/reveal';

/**
 * "Los más pedidos": un producto protagonista (el que tiene etiqueta, o el primero)
 * y el resto en una lista compacta. Las imágenes del catálogo son flyers cargados,
 * así que solo una se muestra grande.
 */
@Component({
  selector: 'app-featured-showcase',
  imports: [RouterLink, NgOptimizedImage, Icon, MediaPipe, MoneyPipe, Reveal],
  template: `
    @if (spotlight(); as s) {
      <div class="grid gap-5 lg:grid-cols-12">
        <!-- Protagonista -->
        <article class="group/spot relative overflow-hidden rounded-[2rem] bg-navy-900 text-white lg:col-span-7" appReveal>
          <div class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/40 blur-2xl motion-safe:animate-glow"></div>
          <div class="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-brand-400/20 blur-3xl motion-safe:animate-glow [animation-delay:-2.5s]"></div>
          <div class="relative grid h-full gap-6 p-5 sm:grid-cols-2 sm:p-6">
            <a [routerLink]="['/producto', s.slug]" class="relative block aspect-square overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 transition duration-500 group-hover/spot:-rotate-2 group-hover/spot:scale-[1.02] sm:self-center">
              <img [ngSrc]="s.imageUrl | media" [alt]="s.name" fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 28vw" class="object-cover transition duration-700 group-hover/spot:scale-110" />
              @if (s.badge) {
                <span class="absolute left-3 top-3 inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 bg-[length:200%_auto] px-3 py-1 text-xs font-semibold shadow motion-safe:animate-shine">
                  <app-icon name="sparkle" [size]="14" /> {{ s.badge }}
                </span>
              }
            </a>

            <div class="flex flex-col">
              <span class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200"><span class="text-white/40">01</span> · Favorito de la semana</span>
              @if (s.category) { <span class="mt-3 text-sm text-brand-200/80">{{ s.category.name }}</span> }
              <a [routerLink]="['/producto', s.slug]" class="mt-1 text-2xl font-extrabold leading-tight hover:text-brand-200 sm:text-3xl">{{ s.name }}</a>
              <ul class="mt-4 space-y-2">
                @for (f of s.features.slice(0, 3); track f) {
                  <li class="flex items-start gap-2 text-sm text-brand-50/90 transition duration-300 group-hover/spot:translate-x-1">
                    <span class="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-500/30 text-brand-200"><app-icon name="check" [size]="11" /></span>
                    {{ f }}
                  </li>
                }
              </ul>

              <div class="mt-auto pt-6">
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-extrabold">{{ s.price | money }}</span>
                  @if (s.compareAtPrice && s.compareAtPrice > s.price) {
                    <span class="text-lg text-brand-200 line-through">{{ s.compareAtPrice | money }}</span>
                  }
                </div>
                <span class="text-xs text-brand-200">IVA incluido{{ s.stock > 0 && s.stock <= 3 ? ' · ¡quedan ' + s.stock + '!' : '' }}</span>
                <button type="button" class="btn-primary mt-4 w-full" [disabled]="s.stock <= 0" (click)="add(s)">
                  <app-icon name="cart" [size]="18" /> {{ s.stock > 0 ? 'Agregar al carrito' : 'Agotado' }}
                </button>
                <a [routerLink]="['/producto', s.slug]" class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 transition-all hover:gap-2.5 hover:text-white">
                  Ver detalle <app-icon name="arrow-right" [size]="15" />
                </a>
              </div>
            </div>
          </div>
        </article>

        <!-- Resto -->
        <ol class="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          @for (p of others(); track p.id; let i = $index) {
            <li class="group flex items-center gap-4 rounded-3xl border border-brand-100 bg-white p-3 transition duration-300 hover:-translate-x-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10" [appReveal]="120 + i * 90">
              <a [routerLink]="['/producto', p.slug]" class="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-brand-50">
                <img [src]="p.imageUrl | media" [alt]="p.name" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110" />
              </a>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                  <span class="text-slate-300">{{ (i + 2).toString().padStart(2, '0') }}</span>
                  <span class="truncate text-brand-500">{{ p.category?.name }}</span>
                </div>
                <a [routerLink]="['/producto', p.slug]" class="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-navy-900 hover:text-brand-600">{{ p.name }}</a>
                <div class="mt-1 flex items-center gap-2">
                  <span class="font-bold text-navy-900">{{ p.price | money }}</span>
                  @if (p.stock <= 0) {
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Agotado</span>
                  } @else if (p.stock <= 3) {
                    <span class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Quedan {{ p.stock }}</span>
                  }
                </div>
              </div>
              <button type="button"
                      class="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-navy-900 transition duration-300 hover:rotate-90 hover:bg-navy-900 hover:text-white active:scale-90 disabled:opacity-40"
                      [disabled]="p.stock <= 0" (click)="add(p)" [attr.aria-label]="'Agregar ' + p.name + ' al carrito'">
                <app-icon name="plus" [size]="18" />
              </button>
            </li>
          }
        </ol>
      </div>
    } @else {
      <div class="grid gap-5 lg:grid-cols-12">
        <div class="h-[420px] animate-pulse rounded-[2rem] bg-brand-100/60 lg:col-span-7"></div>
        <div class="grid gap-3 lg:col-span-5">
          @for (s of [1, 2, 3, 4, 5]; track s) { <div class="h-[104px] animate-pulse rounded-3xl bg-brand-100/60"></div> }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedShowcase {
  readonly products = input.required<Product[]>();

  private readonly cart = inject(CartStore);
  private readonly toast = inject(ToastService);

  protected readonly spotlight = computed(() => {
    const list = this.products();
    return list.find((p) => p.badge && p.stock > 0) ?? list[0] ?? null;
  });
  protected readonly others = computed(() => this.products().filter((p) => p.id !== this.spotlight()?.id).slice(0, 5));

  protected add(p: Product): void {
    this.cart.add(p);
    this.toast.success(`${p.name} agregado al carrito`);
  }
}
