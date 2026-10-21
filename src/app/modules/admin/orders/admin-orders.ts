import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api';
import { AdminOrder, OrderStatus } from '../../../shared/models/order';
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '../../../shared/config/order-status';
import { MoneyPipe } from '../../../shared/pipes/money';
import { Icon } from '../../../shared/components/icon';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink, DatePipe, MoneyPipe, Icon],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div><h1 class="text-2xl font-bold">Pedidos</h1><p class="text-sm text-slate-500">{{ total() }} en total</p></div>
      <form class="relative w-full max-w-xs" (submit)="$event.preventDefault(); search.set(q.value.trim()); page.set(1)">
        <input #q type="search" class="field pl-10" placeholder="N.º, cliente, correo o cédula" />
        <app-icon name="search" [size]="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </form>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      @for (s of filters; track s.value) {
        <button type="button" class="rounded-full border px-3 py-1.5 text-xs font-semibold"
                [class]="status() === s.value ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-200 bg-white hover:border-brand-500'"
                (click)="status.set(s.value); page.set(1)">{{ s.label }}</button>
      }
    </div>

    <div class="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr><th class="px-4 py-3">Pedido</th><th class="px-4 py-3">Cliente</th><th class="px-4 py-3">Pago</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3 text-right">Total</th></tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (o of orders(); track o.id) {
            <tr class="cursor-pointer hover:bg-brand-50/40" [routerLink]="['/admin/pedidos', o.id]">
              <td class="px-4 py-3"><span class="font-semibold">{{ o.code }}</span><span class="block text-xs text-slate-500">{{ o.createdAt | date: 'd MMM, HH:mm' }}</span></td>
              <td class="px-4 py-3">{{ o.customerName }}<span class="block text-xs text-slate-500">{{ o.city }} · {{ o.phone }}</span></td>
              <td class="px-4 py-3 capitalize">{{ o.paymentMethod }}</td>
              <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="statusClass[o.status]">{{ statusLabel[o.status] }}</span></td>
              <td class="px-4 py-3 text-right font-semibold">{{ o.total | money: true }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="px-4 py-12 text-center text-slate-500">{{ loading() ? 'Cargando…' : 'No hay pedidos.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (pages() > 1) {
      <div class="mt-4 flex items-center justify-end gap-2 text-sm">
        <button type="button" class="btn-outline px-3 py-2" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Anterior</button>
        <span>{{ page() }} / {{ pages() }}</span>
        <button type="button" class="btn-outline px-3 py-2" [disabled]="page() >= pages()" (click)="page.set(page() + 1)">Siguiente</button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders {
  private readonly api = inject(AdminApi);

  protected readonly statusLabel = ORDER_STATUS_LABEL;
  protected readonly statusClass = ORDER_STATUS_CLASS;
  protected readonly filters: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'pending_confirmation', label: 'Por confirmar' },
    { value: 'pending_payment', label: 'Esperando pago' },
    { value: 'paid', label: 'Pagados' },
    { value: 'preparing', label: 'En preparación' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
    { value: 'expired', label: 'Expirados' },
  ];

  protected readonly status = signal<OrderStatus | ''>('');
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly orders = signal<AdminOrder[]>([]);
  protected readonly total = signal(0);
  protected readonly pages = signal(1);
  protected readonly loading = signal(true);

  constructor() {
    effect((onCleanup) => {
      this.loading.set(true);
      const sub = this.api
        .orders({ status: this.status(), search: this.search(), page: this.page(), pageSize: 20 })
        .subscribe({
          next: (r) => {
            this.orders.set(r.items);
            this.total.set(r.totalItems);
            this.pages.set(r.totalPages);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      onCleanup(() => sub.unsubscribe());
    });
  }
}
