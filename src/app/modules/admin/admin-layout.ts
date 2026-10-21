import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSession } from '../../shared/services/auth-session';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <div class="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside class="flex items-center gap-2 bg-navy-900 px-4 py-3 text-white lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:px-4 lg:py-6">
        <a routerLink="/admin" class="flex items-center gap-2 lg:mb-8 lg:px-2">
          <img src="/brand/sws-isotipo.webp" alt="" width="40" height="33" class="h-8 w-auto rounded bg-white p-0.5" />
          <span class="text-sm font-bold">SWS Admin</span>
        </a>
        <nav class="ml-auto flex gap-1 lg:ml-0 lg:flex-col">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="bg-white/10 text-white" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/5">
              <app-icon [name]="l.icon" [size]="18" /><span class="hidden sm:inline">{{ l.label }}</span>
            </a>
          }
          <a href="/" target="_blank" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/5">
            <app-icon name="external" [size]="18" /><span class="hidden sm:inline">Ver tienda</span>
          </a>
        </nav>
        <div class="hidden lg:mt-auto lg:block">
          <p class="truncate px-2 text-xs text-brand-200">{{ auth.session()?.email }}</p>
          <button type="button" class="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brand-100 hover:bg-white/5" (click)="auth.logout()">
            <app-icon name="logout" [size]="18" /> Salir
          </button>
        </div>
        <button type="button" class="rounded-xl p-2 text-brand-100 hover:bg-white/5 lg:hidden" (click)="auth.logout()" aria-label="Salir"><app-icon name="logout" [size]="18" /></button>
      </aside>
      <main class="min-w-0 p-4 sm:p-8"><router-outlet /></main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly auth = inject(AuthSession);
  protected readonly links = [
    { path: '/admin/pedidos', label: 'Pedidos', icon: 'orders' },
    { path: '/admin/productos', label: 'Productos', icon: 'package' },
  ];
}
