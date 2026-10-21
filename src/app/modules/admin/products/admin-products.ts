import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api';
import { Product } from '../../../shared/models/catalog';
import { MediaPipe } from '../../../shared/pipes/media';
import { MoneyPipe } from '../../../shared/pipes/money';
import { Icon } from '../../../shared/components/icon';
import { ToastService } from '../../../shared/services/toast';
import { httpErrorMessage } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, MediaPipe, MoneyPipe, Icon],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div><h1 class="text-2xl font-bold">Productos</h1><p class="text-sm text-slate-500">Ajusta el stock directamente en la tabla.</p></div>
      <div class="flex w-full gap-2 sm:w-auto">
        <form class="relative flex-1 sm:w-64" (submit)="$event.preventDefault(); search.set(q.value.trim())">
          <input #q type="search" class="field pl-10" placeholder="Nombre o SKU" />
          <app-icon name="search" [size]="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
        <a routerLink="/admin/productos/nuevo" class="btn-primary"><app-icon name="plus" [size]="18" /> Nuevo</a>
      </div>
    </div>

    <div class="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr><th class="px-4 py-3">Producto</th><th class="px-4 py-3">Categoría</th><th class="px-4 py-3 text-right">Precio</th><th class="px-4 py-3">Stock</th><th class="px-4 py-3">Activo</th><th class="px-4 py-3"></th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (p of products(); track p.id) {
            <tr [class.opacity-50]="!p.isStatus">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="relative size-12 shrink-0 overflow-hidden rounded-lg bg-brand-50"><img [src]="p.imageUrl | media" alt="" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" /></div>
                  <span><span class="font-medium">{{ p.name }}</span><span class="block text-xs text-slate-400">{{ p.sku }}</span></span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-500">{{ p.category?.name }}</td>
              <td class="px-4 py-3 text-right font-semibold">{{ p.price | money: true }}</td>
              <td class="px-4 py-3">
                <input type="number" min="0" class="field w-24 py-2" [value]="p.stock" [class.border-red-300]="p.stock === 0"
                       (change)="saveStock(p, $any($event.target).valueAsNumber)" [attr.aria-label]="'Stock de ' + p.name" />
              </td>
              <td class="px-4 py-3">
                <button type="button" role="switch" [attr.aria-checked]="p.isStatus" (click)="toggle(p)"
                        class="relative h-6 w-11 rounded-full transition" [class]="p.isStatus ? 'bg-brand-500' : 'bg-slate-300'"
                        [attr.aria-label]="(p.isStatus ? 'Desactivar ' : 'Activar ') + p.name">
                  <span class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-all" [class]="p.isStatus ? 'left-5.5' : 'left-0.5'"></span>
                </button>
              </td>
              <td class="px-4 py-3 text-right"><a [routerLink]="['/admin/productos', p.id]" class="btn-ghost"><app-icon name="edit" [size]="16" /> Editar</a></td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="px-4 py-12 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'Sin productos.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProducts {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);

  protected readonly search = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    effect((onCleanup) => {
      this.loading.set(true);
      const sub = this.api.products({ search: this.search(), pageSize: 100 }).subscribe({
        next: (r) => {
          this.products.set(r.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected saveStock(p: Product, stock: number): void {
    if (!Number.isInteger(stock) || stock < 0) {
      this.toast.error('El stock debe ser un número entero ≥ 0.');
      return;
    }
    this.api.setStock(p.id, stock).subscribe({
      next: () => {
        this.patch(p.id, { stock });
        this.toast.success(`Stock de ${p.name}: ${stock}`);
      },
      error: (e: unknown) => this.toast.error(httpErrorMessage(e)),
    });
  }

  protected toggle(p: Product): void {
    this.api.setActive(p.id, !p.isStatus).subscribe({
      next: () => this.patch(p.id, { isStatus: !p.isStatus }),
      error: (e: unknown) => this.toast.error(httpErrorMessage(e)),
    });
  }

  private patch(id: string, changes: Partial<Product>): void {
    this.products.update((list) => list.map((x) => (x.id === id ? { ...x, ...changes } : x)));
  }
}
