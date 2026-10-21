import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogApi } from '../../shared/services/catalog-api';
import { Seo } from '../../shared/services/seo';
import { Product } from '../../shared/models/catalog';
import { ProductCard } from '../../shared/components/product-card';
import { Icon } from '../../shared/components/icon';
import { Reveal } from '../../shared/directives/reveal';

const SORTS = [
  { value: '', label: 'Destacados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más nuevos' },
];

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, ProductCard, Icon, Reveal],
  template: `
    <section class="border-b border-brand-100 bg-brand-50/50">
      <div class="container-page py-10">
        <nav class="text-xs text-slate-500" aria-label="Migas"><a routerLink="/" class="hover:text-brand-600">Inicio</a> / <span>Catálogo</span></nav>
        <h1 class="mt-3 animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">{{ heading() }}</h1>
        <p class="mt-2 text-slate-500">{{ subheading() }}</p>
        <div class="section-bar"></div>
      </div>
    </section>

    <div class="container-page py-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" role="tablist">
          <a routerLink="/catalogo" [queryParams]="{ categoria: null }" queryParamsHandling="merge"
             class="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition"
             [class]="!categoria() ? 'border-navy-900 bg-navy-900 text-white' : 'border-brand-100 bg-white hover:border-brand-500'">Todos</a>
          @for (c of categories(); track c.id) {
            <a routerLink="/catalogo" [queryParams]="{ categoria: c.slug }" queryParamsHandling="merge"
               class="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition"
               [class]="categoria() === c.slug ? 'border-navy-900 bg-navy-900 text-white' : 'border-brand-100 bg-white hover:border-brand-500'">{{ c.name }}</a>
          }
        </div>
        <div class="flex items-center gap-3">
          @if (q()) {
            <a routerLink="/catalogo" [queryParams]="{ q: null }" queryParamsHandling="merge" class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-2 text-sm text-brand-700">
              “{{ q() }}” <app-icon name="close" [size]="14" />
            </a>
          }
          <label class="sr-only" for="sort">Ordenar</label>
          <select id="sort" class="field w-auto py-2.5" [value]="orden() ?? ''" (change)="sortBy($any($event.target).value)">
            @for (s of sorts; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
          </select>
        </div>
      </div>

      <p class="mt-6 text-sm text-slate-500">{{ loading() ? 'Cargando…' : total() + (total() === 1 ? ' producto' : ' productos') }}</p>

      <div class="mt-4 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        @for (p of products(); track p.id; let i = $index) {
          <app-product-card [product]="p" [priority]="i < 4" [appReveal]="(i % 4) * 80" />
        } @empty {
          @if (loading()) {
            @for (s of [1, 2, 3, 4, 5, 6, 7, 8]; track s) { <div class="card aspect-[3/4] animate-pulse bg-brand-50"></div> }
          } @else {
            <div class="col-span-full rounded-3xl border border-dashed border-brand-200 p-12 text-center">
              <p class="font-semibold">No encontramos productos.</p>
              <p class="mt-1 text-sm text-slate-500">Prueba otra búsqueda o escríbenos: lo conseguimos para ti.</p>
              <a routerLink="/catalogo" class="btn-outline mt-5">Ver todo el catálogo</a>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly catalog = inject(CatalogApi);
  private readonly router = inject(Router);
  private readonly seo = inject(Seo);

  /** Query params enlazados por withComponentInputBinding(). */
  readonly categoria = input<string | undefined>();
  readonly q = input<string | undefined>();
  readonly orden = input<string | undefined>();

  protected readonly sorts = SORTS;
  protected readonly categories = toSignal(this.catalog.categories(), { initialValue: [] });
  protected readonly products = signal<Product[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);

  private readonly current = computed(() => this.categories().find((c) => c.slug === this.categoria()) ?? null);
  protected readonly heading = computed(() => (this.q() ? `Resultados para “${this.q()}”` : this.current()?.name ?? 'Catálogo'));
  protected readonly subheading = computed(
    () => this.current()?.description ?? 'Tecnología original: 100% importada, nueva y sellada.',
  );

  constructor() {
    effect((onCleanup) => {
      const query = { category: this.categoria(), search: this.q(), sort: this.orden(), pageSize: 48 };
      this.loading.set(true);
      const sub = this.catalog.products(query).subscribe({
        next: (r) => {
          this.products.set(r.items);
          this.total.set(r.totalItems);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      const c = this.current();
      this.seo.set({
        title: `${c?.name ?? 'Catálogo'} · Sale World Sale`,
        description: c?.description
          ? `${c.description}. Productos originales, importados, nuevos y sellados en Ecuador.`
          : 'Catálogo Sale World Sale: streaming, hogar inteligente, audio, cables y cargadores Apple originales.',
        path: c ? `/catalogo?categoria=${c.slug}` : '/catalogo',
      });
    });
  }

  protected sortBy(value: string): void {
    void this.router.navigate([], { queryParams: { orden: value || null }, queryParamsHandling: 'merge' });
  }
}
