import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CatalogApi } from '../../shared/services/catalog-api';
import { Seo } from '../../shared/services/seo';
import { FeaturedShowcase } from './featured-showcase';
import { Icon } from '../../shared/components/icon';
import { Reveal } from '../../shared/directives/reveal';
import { STORE } from '../../shared/config/store';
import { whatsAppUrl } from '../../shared/utils/whatsapp';

const CATEGORY_IMAGE: Record<string, string> = {
  streaming: '/products/fire-tv-stick-4k-select.webp',
  'hogar-inteligente': '/products/echo-dot-5-azul.webp',
  audio: '/products/jbl-tune-flex-2.webp',
  'cables-apple': '/products/cable-apple-usbc-lightning.webp',
  'carga-rapida': '/products/cubo-apple-usbc-20w.webp',
  accesorios: '/products/case-airpods-4-kit-limpieza.webp',
  'mas-para-ti': '/products/ugreen-finetrack.webp',
};

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, NgOptimizedImage, FeaturedShowcase, Icon, Reveal],
  template: `
    <!-- Hero (portada del Catálogo 2026) -->
    <section class="relative overflow-hidden bg-navy-900 text-white">
      <div class="pointer-events-none absolute -right-32 -top-40 size-[520px] rounded-full bg-brand-500 motion-safe:animate-drift sm:-right-20"></div>
      <div class="pointer-events-none absolute -bottom-48 -left-40 size-[420px] rounded-full bg-navy-700/70 motion-safe:animate-drift [animation-delay:-8s]"></div>
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)] [background-size:28px_28px]"></div>

      <div class="container-page relative grid items-center gap-10 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <div>
          <p class="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">Catálogo de productos {{ year }}</p>
          <h1 class="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span class="block animate-fade-up [animation-delay:120ms]">Tecnología original,</span>
            <span class="block animate-fade-up [animation-delay:240ms]"><span class="bg-gradient-to-r from-brand-300 via-white to-brand-300 bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-shine">a tu alcance.</span></span>
          </h1>
          <p class="mt-5 max-w-lg animate-fade-up text-base text-brand-100/90 [animation-delay:360ms] sm:text-lg">{{ trustLine }}</p>
          <div class="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:480ms]">
            <a routerLink="/catalogo" class="group/cta btn-primary px-7 py-3.5 text-base">Ver catálogo <app-icon name="arrow-right" [size]="18" class="transition group-hover/cta:translate-x-1" /></a>
            <a [href]="whatsApp" target="_blank" rel="noopener" class="btn border border-white/25 bg-white/5 px-7 py-3.5 text-base text-white hover:bg-white/10">
              <app-icon name="whatsapp" [size]="18" /> Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-md animate-zoom-in [animation-delay:200ms]">
          <div class="pointer-events-none absolute inset-6 rounded-full bg-brand-400 blur-3xl motion-safe:animate-glow"></div>
          <div class="relative aspect-square overflow-hidden rounded-[2.5rem] border-8 border-white/10 shadow-2xl shadow-black/30 motion-safe:animate-float">
            <img ngSrc="/products/airpods-5.webp" alt="AirPods 5 con obsequios" fill priority sizes="(max-width: 1024px) 90vw, 40vw" class="object-cover" />
          </div>

        </div>
      </div>
    </section>

    <!-- Marcas -->
    <div class="group/marquee relative overflow-hidden border-y border-white/10 bg-navy-950 py-4 text-white" aria-label="Marcas originales">
      <div class="flex w-max motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused]">
        @for (copy of [0, 1]; track copy) {
          <ul class="flex shrink-0 items-center" [attr.aria-hidden]="copy === 1">
            @for (b of brands; track b) {
              <li class="flex items-center gap-10 px-5 text-sm font-semibold uppercase tracking-[0.25em] text-brand-100/80">
                {{ b }}<span class="size-1.5 rounded-full bg-brand-500"></span>
              </li>
            }
          </ul>
        }
      </div>
      <div class="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-navy-950"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-navy-950"></div>
    </div>

    <!-- Confianza -->
    <section class="border-b border-brand-100 bg-white">
      <div class="container-page grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
        @for (t of trust; track t.label; let i = $index) {
          <div class="group flex items-center gap-3" [appReveal]="i * 90">
            <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-500 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white"><app-icon [name]="t.icon" /></span>
            <span class="text-sm font-semibold leading-tight">{{ t.label }}<span class="block text-xs font-normal text-slate-500">{{ t.hint }}</span></span>
          </div>
        }
      </div>
    </section>

    <!-- Categorías -->
    <section class="container-page py-14">
      <div class="flex items-end justify-between gap-4" appReveal>
        <div>
          <h2 class="section-title">En este catálogo</h2>
          <div class="section-bar"></div>
        </div>
        <a routerLink="/catalogo" class="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline">Ver todo</a>
      </div>
      <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        @for (c of categories(); track c.id; let i = $index) {
          <a routerLink="/catalogo" [queryParams]="{ categoria: c.slug }"
             class="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-3xl bg-navy-900 p-5 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/25"
             [class.sm:col-span-2]="i === 0" [appReveal]="(i % 4) * 90">
            <img [ngSrc]="categoryImage(c.slug)" alt="" fill sizes="(max-width: 640px) 50vw, 25vw" class="object-cover opacity-55 transition duration-700 group-hover:scale-110 group-hover:opacity-75" />
            <div class="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent"></div>
            <span class="absolute right-4 top-4 grid size-9 translate-x-2 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <app-icon name="arrow-right" [size]="16" />
            </span>
            <div class="relative transition duration-300 group-hover:-translate-y-0.5">
              <span class="text-xs font-medium text-brand-200">{{ c.productCount }} productos</span>
              <h3 class="text-lg font-bold leading-tight">{{ c.name }}</h3>
              <p class="mt-0.5 line-clamp-1 text-xs text-brand-100/80">{{ c.description }}</p>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- Destacados -->
    <section class="bg-brand-50/50 py-14">
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-4" appReveal>
          <div>
            <h2 class="section-title">Los más pedidos</h2>
            <div class="section-bar"></div>
            <p class="mt-3 max-w-md text-sm text-slate-500">Lo que más se llevan nuestros clientes. Stock limitado: cuando se agota, se agota.</p>
          </div>
          <a routerLink="/catalogo" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-all hover:gap-2.5 hover:text-brand-700">
            Ver todo el catálogo <app-icon name="arrow-right" [size]="16" />
          </a>
        </div>
        <div class="mt-8"><app-featured-showcase [products]="featured()" /></div>
      </div>
    </section>

    <!-- CTA -->
    <section class="container-page py-16">
      <div class="relative overflow-hidden rounded-[2rem] bg-black px-6 py-12 text-center text-white sm:px-12" appReveal>
        <div class="pointer-events-none absolute -bottom-56 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-brand-500 motion-safe:animate-glow"></div>
        <div class="relative">
          <div class="relative mx-auto grid size-24 place-items-center">
            <span class="absolute inset-0 rounded-full border-2 border-brand-400/60 motion-safe:animate-ping-slow"></span>
            <span class="absolute inset-2 rounded-full bg-white/5"></span>
            <img src="/brand/sws-isotipo.webp" alt="" width="96" height="78" class="relative h-14 w-auto" loading="lazy" />
          </div>
          <h2 class="mt-5 text-3xl font-bold sm:text-4xl">¿Listo para tu pedido?</h2>
          <p class="mt-2 text-brand-100">Paga en línea con tarjeta o escríbenos y te confirmamos disponibilidad.</p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <a routerLink="/catalogo" class="btn-primary">Comprar ahora</a>
            <a [href]="whatsApp" target="_blank" rel="noopener" class="btn-whatsapp"><app-icon name="whatsapp" [size]="18" /> {{ store.whatsAppDisplay }}</a>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly catalog = inject(CatalogApi);

  protected readonly store = STORE;
  protected readonly year = new Date().getFullYear();
  protected readonly trustLine = STORE.trust.join(' · ').toLowerCase();
  protected readonly whatsApp = whatsAppUrl('Hola Sale World Sale, quiero hacer un pedido.');
  protected readonly brands = ['Amazon', 'Apple', 'JBL', 'Beats', 'UGREEN', 'Puma', 'Alexa', 'Fire TV'];
  protected readonly trust = [
    { icon: 'box', label: '100% importados', hint: 'Directo de origen' },
    { icon: 'shield', label: 'Originales', hint: 'Marcas oficiales' },
    { icon: 'sparkle', label: 'Nuevos y sellados', hint: 'En su empaque' },
    { icon: 'truck', label: 'Envíos a todo Ecuador', hint: 'Coordinamos contigo' },
  ];

  protected readonly categories = toSignal(this.catalog.categories(), { initialValue: [] });
  protected readonly featured = toSignal(
    this.catalog.products({ featured: true, pageSize: 6 }).pipe(map((r) => r.items)),
    { initialValue: [] },
  );
  private readonly cheapest = toSignal(
    this.catalog.products({ sort: 'price_asc', pageSize: 1 }).pipe(map((r) => r.items[0]?.price ?? null)),
    { initialValue: null },
  );
  protected readonly minPrice = computed(() => `$${this.cheapest() ?? 10}`);

  constructor() {
    inject(Seo).set({
      title: 'Sale World Sale · Tecnología original, a tu alcance',
      description:
        'Fire TV Stick, Echo Dot, AirPods, JBL, cables y cargadores Apple originales en Ecuador. 100% importados, nuevos y sellados. Paga en línea o pide por WhatsApp.',
      path: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Sale World Sale',
        slogan: 'Innovando para Ti...',
        telephone: '+593999515240',
        email: STORE.email,
        address: { '@type': 'PostalAddress', addressCountry: 'EC' },
      },
    });
  }

  protected categoryImage(slug: string): string {
    return CATEGORY_IMAGE[slug] ?? '/brand/sws-isotipo.webp';
  }
}
