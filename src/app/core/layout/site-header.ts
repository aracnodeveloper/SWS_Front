import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogApi } from '../../shared/services/catalog-api';
import { CartStore } from '../../shared/services/cart-store';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
  
    <header class="sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-shadow duration-300"
            [class]="scrolled() ? 'border-transparent shadow-lg shadow-navy-900/5' : 'border-brand-100/70'">
      <div class="container-page flex h-18 items-center gap-4">
        <button type="button" class="btn-ghost -ml-2 lg:hidden" (click)="menuOpen.set(!menuOpen())" aria-label="Menú">
          <app-icon [name]="menuOpen() ? 'close' : 'menu'" />
        </button>

        <a routerLink="/" class="group flex items-center gap-2.5" aria-label="Sale World Sale — inicio">
          <img src="/brand/sws-isotipo.webp" alt="" width="52" height="42" class="h-10 w-auto transition duration-300 group-hover:-rotate-6 group-hover:scale-110" />
          <span class="hidden leading-none sm:block">
            <span class="block text-[15px] font-extrabold tracking-tight text-navy-900">SALE WORLD SALE</span>
            <span class="block text-[11px] font-medium text-brand-500">Innovando para Ti...</span>
          </span>
        </a>

        <nav class="ml-4 hidden items-center gap-1 whitespace-nowrap text-sm font-medium lg:flex" aria-label="Principal">
          <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="text-brand-600" class="rounded-lg px-3 py-2 hover:text-brand-600">Inicio</a>
          <a routerLink="/catalogo" routerLinkActive="text-brand-600" [routerLinkActiveOptions]="{ exact: true }" class="rounded-lg px-3 py-2 hover:text-brand-600">Catálogo</a>
          @for (c of categories().slice(0, 4); track c.id; let i = $index) {
            <a routerLink="/catalogo" [queryParams]="{ categoria: c.slug }" class="rounded-lg px-3 py-2 text-slate-600 hover:text-brand-600" [class.hidden]="i >= 2" [class.xl:inline]="i >= 2">{{ c.name }}</a>
          }
        </nav>

        <form class="relative ml-auto hidden max-w-xs flex-1 md:block" (submit)="search($event, q.value)" role="search">
          <input #q type="search" name="q" placeholder="Buscar productos" class="field rounded-full py-2.5 pl-10" aria-label="Buscar productos" />
          <app-icon name="search" [size]="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>

        <button type="button" class="relative ml-auto grid size-11 place-items-center rounded-xl bg-brand-50 text-navy-900 transition hover:bg-brand-100 active:scale-95 md:ml-0" (click)="cart.drawerOpen.set(true)" aria-label="Abrir carrito">
          <app-icon name="cart" [class.animate-wiggle]="bump()" />
          @if (cart.count() > 0) {
            <span class="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white" [class.animate-pop]="bump()">{{ cart.count() }}</span>
          }
        </button>
      </div>

      @if (menuOpen()) {
        <div class="border-t border-brand-100 bg-white lg:hidden">
          <div class="container-page space-y-1 py-4">
            <form class="relative mb-3" (submit)="search($event, mq.value)" role="search">
              <input #mq type="search" placeholder="Buscar productos" class="field rounded-full pl-10" aria-label="Buscar productos" />
              <app-icon name="search" [size]="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>
            <a routerLink="/catalogo" (click)="menuOpen.set(false)" class="block rounded-xl px-3 py-2.5 font-semibold hover:bg-brand-50">Todo el catálogo</a>
            @for (c of categories(); track c.id) {
              <a routerLink="/catalogo" [queryParams]="{ categoria: c.slug }" (click)="menuOpen.set(false)" class="flex justify-between rounded-xl px-3 py-2.5 hover:bg-brand-50">
                {{ c.name }} <span class="text-xs text-slate-400">{{ c.productCount }}</span>
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
  host: { '(window:scroll)': 'onScroll()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  protected readonly categories = toSignal(inject(CatalogApi).categories(), { initialValue: [] });
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  /** true durante la animación cuando el carrito suma unidades. */
  protected readonly bump = signal(false);

  constructor() {
    let previous = this.cart.count();
    let timer: ReturnType<typeof setTimeout> | undefined;
    effect(() => {
      const count = this.cart.count();
      if (count > previous) {
        this.bump.set(false);
        clearTimeout(timer);
        setTimeout(() => this.bump.set(true), 20);
        timer = setTimeout(() => this.bump.set(false), 550);
      }
      previous = count;
    });
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected search(event: Event, value: string): void {
    event.preventDefault();
    this.menuOpen.set(false);
    void this.router.navigate(['/catalogo'], { queryParams: { q: value.trim() || null } });
  }
}
