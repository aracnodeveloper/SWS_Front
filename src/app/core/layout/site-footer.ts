import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CatalogApi } from '../../shared/services/catalog-api';
import { Icon } from '../../shared/components/icon';
import { STORE } from '../../shared/config/store';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, Icon],
  template: `
    <footer class="relative overflow-hidden bg-black text-slate-300">
      <div class="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand-500/25 blur-3xl"></div>
      <div class="container-page relative grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img src="/brand/sws-logo-dark.webp" alt="Sale World Sale — Innovando para Ti" width="160" height="160" class="size-36 rounded-full" loading="lazy" />
          <p class="mt-4 max-w-xs text-sm">Tecnología original, a tu alcance. Productos {{ trust }}.</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Catálogo</h3>
          <ul class="mt-4 space-y-2 text-sm">
            @for (c of categories(); track c.id) {
              <li><a routerLink="/catalogo" [queryParams]="{ categoria: c.slug }" class="hover:text-white">{{ c.name }}</a></li>
            }
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-white">¿Listo para tu pedido?</h3>
          <p class="mt-4 text-sm">Escríbenos y te confirmamos disponibilidad.</p>
          <div class="mt-4 space-y-3">
            <a [href]="'https://wa.me/' + store.whatsAppNumber" target="_blank" rel="noopener" class="flex items-center justify-between rounded-2xl border border-brand-500/60 bg-navy-900 px-4 py-3 text-sm hover:border-brand-400">
              <span class="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-200"><app-icon name="whatsapp" [size]="16" /> WhatsApp</span>
              <span class="font-semibold text-white">{{ store.whatsAppDisplay }}</span>
            </a>
            <a [href]="'mailto:' + store.email" class="flex items-center justify-between gap-3 rounded-2xl border border-brand-500/60 bg-navy-900 px-4 py-3 text-sm hover:border-brand-400">
              <span class="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-200"><app-icon name="mail" [size]="16" /> Correo</span>
              <span class="truncate font-semibold text-white">{{ store.email }}</span>
            </a>
          </div>
        </div>
      </div>
      <div class="relative border-t border-white/10">
        <div class="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>© {{ year }} Sale World Sale · Innovando para Ti...</span>
          <span>Stock limitado · Productos originales, nuevos y sellados</span>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly store = STORE;
  protected readonly trust = STORE.trust.join(' · ').toLowerCase();
  protected readonly year = new Date().getFullYear();
  protected readonly categories = toSignal(inject(CatalogApi).categories(), { initialValue: [] });
}
