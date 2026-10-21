import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CatalogApi } from '../../shared/services/catalog-api';
import { CartStore } from '../../shared/services/cart-store';
import { Seo, absoluteImage } from '../../shared/services/seo';
import { ToastService } from '../../shared/services/toast';
import { Product } from '../../shared/models/catalog';
import { ProductCard } from '../../shared/components/product-card';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';
import { Reveal } from '../../shared/directives/reveal';
import { whatsAppUrl } from '../../shared/utils/whatsapp';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-page',
  imports: [RouterLink, NgOptimizedImage, ProductCard, Icon, MediaPipe, MoneyPipe, Reveal],
  template: `
    @if (product(); as p) {
      <div class="container-page py-8">
        <nav class="text-xs text-slate-500" aria-label="Migas">
          <a routerLink="/" class="hover:text-brand-600">Inicio</a> /
          <a routerLink="/catalogo" class="hover:text-brand-600">Catálogo</a>
          @if (p.category) { / <a routerLink="/catalogo" [queryParams]="{ categoria: p.category.slug }" class="hover:text-brand-600">{{ p.category.name }}</a> }
        </nav>

        <div class="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div class="group relative aspect-square animate-zoom-in overflow-hidden rounded-[2rem] bg-brand-50/70">
            <img [ngSrc]="p.imageUrl | media" [alt]="p.name" fill priority sizes="(max-width: 1024px) 100vw, 50vw" class="object-cover transition duration-700 group-hover:scale-105" />
            @if (p.badge) {
              <span class="absolute left-5 top-5 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow">{{ p.badge }}</span>
            }
          </div>

          <div class="flex animate-fade-up flex-col [animation-delay:120ms]">
            @if (p.category) { <span class="chip self-start">{{ p.category.name }}</span> }
            <h1 class="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{{ p.name }}</h1>
            @if (p.brand) { <p class="mt-1 text-sm text-slate-500">Marca: {{ p.brand }} · SKU {{ p.sku }}</p> }
            <p class="mt-5 text-base leading-relaxed text-slate-600">{{ p.description }}</p>

            <ul class="mt-6 space-y-2.5">
              @for (f of p.features; track f; let i = $index) {
                <li class="flex animate-fade-up items-start gap-3 text-sm font-medium" [style.animation-delay.ms]="260 + i * 70"><span class="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500"></span>{{ f }}</li>
              }
            </ul>

            <div class="mt-8 rounded-3xl bg-navy-900 p-6 text-white">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span class="text-xs uppercase tracking-wider text-brand-200">Precio</span>
                  <div class="flex items-baseline gap-3">
                    <span class="text-4xl font-extrabold">{{ p.price | money }}</span>
                    @if (p.compareAtPrice && p.compareAtPrice > p.price) { <span class="text-lg text-brand-200 line-through">{{ p.compareAtPrice | money }}</span> }
                  </div>
                  <span class="text-xs text-brand-200">IVA incluido</span>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-semibold" [class]="stockClass()">{{ stockLabel() }}</span>
              </div>

              @if (p.stock > 0) {
                <div class="mt-6 flex flex-wrap gap-3">
                  <div class="flex items-center rounded-xl bg-white/10">
                    <button type="button" class="grid size-12 place-items-center hover:text-brand-200" (click)="qty.set(qty() - 1)" [disabled]="qty() <= 1" aria-label="Menos"><app-icon name="minus" [size]="16" /></button>
                    <span class="w-10 text-center text-lg font-semibold" aria-live="polite">{{ qty() }}</span>
                    <button type="button" class="grid size-12 place-items-center hover:text-brand-200 disabled:opacity-30" (click)="qty.set(qty() + 1)" [disabled]="qty() >= maxQty()" aria-label="Más"><app-icon name="plus" [size]="16" /></button>
                  </div>
                  <button type="button" class="btn-primary flex-1" (click)="addToCart(p)"><app-icon name="cart" [size]="18" /> Agregar al carrito</button>
                  <button type="button" class="btn w-full bg-white text-navy-900 hover:bg-brand-50 sm:w-auto" (click)="buyNow(p)">Comprar ahora</button>
                </div>
              }
              <a [href]="askUrl()" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-100 hover:text-white">
                <app-icon name="whatsapp" [size]="16" /> {{ p.stock > 0 ? '¿Dudas? Pregúntanos por WhatsApp' : 'Avísame cuando llegue' }}
              </a>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-medium text-slate-600">
              <div class="rounded-2xl bg-brand-50/70 p-3"><app-icon name="shield" class="mx-auto mb-1 text-brand-500" />Original</div>
              <div class="rounded-2xl bg-brand-50/70 p-3"><app-icon name="sparkle" class="mx-auto mb-1 text-brand-500" />Nuevo y sellado</div>
              <div class="rounded-2xl bg-brand-50/70 p-3"><app-icon name="lock" class="mx-auto mb-1 text-brand-500" />Pago seguro</div>
            </div>
          </div>
        </div>

        @if (related().length) {
          <section class="mt-16">
            <h2 class="section-title">También te puede gustar</h2>
            <div class="section-bar"></div>
            <div class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              @for (r of related(); track r.id; let i = $index) { <app-product-card [product]="r" [appReveal]="i * 80" /> }
            </div>
          </section>
        }
      </div>
    } @else if (notFound()) {
      <div class="container-page py-24 text-center">
        <h1 class="text-2xl font-bold">Producto no encontrado</h1>
        <p class="mt-2 text-slate-500">Puede que ya no esté disponible.</p>
        <a routerLink="/catalogo" class="btn-primary mt-6">Ver catálogo</a>
      </div>
    } @else {
      <div class="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div class="aspect-square animate-pulse rounded-[2rem] bg-brand-50"></div>
        <div class="space-y-4"><div class="h-10 w-3/4 animate-pulse rounded-xl bg-brand-50"></div><div class="h-32 animate-pulse rounded-xl bg-brand-50"></div></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage {
  private readonly catalog = inject(CatalogApi);
  private readonly cart = inject(CartStore);
  private readonly seo = inject(Seo);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly slug = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly related = signal<Product[]>([]);
  protected readonly notFound = signal(false);
  protected readonly qty = signal(1);

  protected readonly maxQty = computed(() => this.cart.limitFor(this.product()?.stock ?? 1));
  protected readonly stockLabel = computed(() => {
    const s = this.product()?.stock ?? 0;
    return s <= 0 ? 'Agotado' : s <= 3 ? `¡Últimas ${s} unidades!` : 'Disponible';
  });
  protected readonly stockClass = computed(() => {
    const s = this.product()?.stock ?? 0;
    return s <= 0 ? 'bg-red-500/20 text-red-200' : s <= 3 ? 'bg-amber-400/20 text-amber-200' : 'bg-emerald-400/20 text-emerald-200';
  });
  protected readonly askUrl = computed(() =>
    whatsAppUrl(`Hola Sale World Sale, tengo una consulta sobre: ${this.product()?.name ?? ''}`),
  );

  constructor() {
    effect((onCleanup) => {
      const slug = this.slug();
      this.product.set(null);
      this.notFound.set(false);
      this.qty.set(1);
      const sub = this.catalog.bySlug(slug).subscribe({
        next: (p) => {
          this.product.set(p);
          this.setSeo(p);
          this.loadRelated(p);
        },
        error: (e: unknown) => {
          if (e instanceof HttpErrorResponse && e.status === 404) this.notFound.set(true);
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected addToCart(p: Product): void {
    this.cart.add(p, this.qty());
    this.toast.success(`${p.name} agregado al carrito`);
  }

  protected buyNow(p: Product): void {
    this.cart.add(p, this.qty());
    this.cart.drawerOpen.set(false);
    void this.router.navigateByUrl('/checkout');
  }

  private loadRelated(p: Product): void {
    if (!p.category) return;
    this.catalog.products({ category: p.category.slug, pageSize: 5 }).subscribe((r) => {
      const others = r.items.filter((x) => x.id !== p.id);
      if (others.length >= 3) return this.related.set(others.slice(0, 4));
      this.catalog.products({ featured: true, pageSize: 6 }).subscribe((f) =>
        this.related.set([...others, ...f.items.filter((x) => x.id !== p.id && !others.some((o) => o.id === x.id))].slice(0, 4)),
      );
    });
  }

  private setSeo(p: Product): void {
    const path = `/producto/${p.slug}`;
    this.seo.set({
      title: `${p.name} · ${p.price ? '$' + p.price : ''} · Sale World Sale`,
      description: `${p.description ?? p.name} Original, importado, nuevo y sellado. Envíos en Ecuador.`,
      path,
      image: p.imageUrl,
      type: 'product',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        sku: p.sku,
        image: p.imageUrl ? [absoluteImage(p.imageUrl)] : undefined,
        description: p.description,
        brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: `${environment.webUrl}${path}`,
          priceCurrency: 'USD',
          price: p.price.toFixed(2),
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Sale World Sale' },
        },
      },
    });
  }
}
