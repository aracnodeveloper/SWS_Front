import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api';
import { AdminOrder, AdminTransaction, OrderStatus } from '../../../shared/models/order';
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL, ORDER_TRANSITIONS } from '../../../shared/config/order-status';
import { MoneyPipe } from '../../../shared/pipes/money';
import { Icon } from '../../../shared/components/icon';
import { ToastService } from '../../../shared/services/toast';
import { httpErrorMessage } from '../../../shared/utils/http-error';
import { whatsAppUrl } from '../../../shared/utils/whatsapp';

@Component({
  selector: 'app-admin-order-detail',
  imports: [RouterLink, DatePipe, MoneyPipe, Icon],
  template: `
    <a routerLink="/admin/pedidos" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><app-icon name="arrow-left" [size]="16" /> Pedidos</a>
    @if (order(); as o) {
      <div class="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold">{{ o.code }}</h1>
          <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="statusClass[o.status]">{{ statusLabel[o.status] }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          @for (next of transitions(); track next) {
            <button type="button" [disabled]="saving()" (click)="setStatus(next)"
                    [class]="next === 'cancelled' ? 'btn border border-red-200 bg-white px-4 py-2 text-red-600 hover:bg-red-50' : 'btn-primary px-4 py-2'">
              {{ actionLabel[next] ?? statusLabel[next] }}
            </button>
          }
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <section class="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 class="font-semibold">Productos</h2>
            <ul class="mt-3 divide-y divide-slate-100 text-sm">
              @for (i of o.items; track i.id) {
                <li class="flex justify-between gap-4 py-2.5"><span>{{ i.quantity }} × {{ i.productName }} <span class="text-xs text-slate-400">{{ i.sku }}</span></span><span class="font-medium">{{ i.lineTotal | money: true }}</span></li>
              }
            </ul>
            <dl class="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div class="flex justify-between"><dt class="text-slate-500">Envío</dt><dd>{{ o.shipping | money: true }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">Base imponible</dt><dd>{{ o.subtotal | money: true }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-500">IVA</dt><dd>{{ o.vat | money: true }}</dd></div>
              <div class="flex justify-between text-base font-bold"><dt>Total</dt><dd>{{ o.total | money: true }}</dd></div>
            </dl>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 class="font-semibold">Pagos</h2>
            @for (t of transactions(); track t.id) {
              <div class="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div class="flex justify-between"><span class="font-medium capitalize">{{ t.gateway }} · {{ t.status }}</span><span>{{ t.amount | money: true }}</span></div>
                <p class="text-xs text-slate-500">{{ t.createdAt | date: 'd MMM y, HH:mm' }}@if (t.authorizationCode) { · Aut. {{ t.authorizationCode }}}@if (t.cardBrand) { · {{ t.cardBrand }} ****{{ t.lastDigits }}}</p>
                @if (t.message) { <p class="mt-1 text-xs text-slate-500">{{ t.message }}</p> }
              </div>
            } @empty {
              <p class="mt-2 text-sm text-slate-500">{{ o.paymentMethod === 'whatsapp' ? 'Pedido por WhatsApp: el pago se coordina manualmente.' : 'Sin intentos de pago.' }}</p>
            }
          </section>

          @if (o.adminNotes) {
            <section class="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 class="font-semibold">Bitácora</h2>
              <pre class="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">{{ o.adminNotes }}</pre>
            </section>
          }
        </div>

        <aside class="space-y-6">
          <section class="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <h2 class="font-semibold">Cliente</h2>
            <p class="mt-3 font-medium">{{ o.customerName }}</p>
            <p class="text-slate-500">CI/RUC {{ o.documentId }}</p>
            <p class="mt-2"><a [href]="'mailto:' + o.email" class="text-brand-600 hover:underline">{{ o.email }}</a></p>
            <a [href]="contactUrl()" target="_blank" rel="noopener" class="btn-whatsapp mt-3 w-full py-2.5"><app-icon name="whatsapp" [size]="16" /> {{ o.phone }}</a>
          </section>
          <section class="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <h2 class="font-semibold">Entrega</h2>
            <p class="mt-3">{{ o.address }}</p>
            @if (o.addressReference) { <p class="text-slate-500">Ref: {{ o.addressReference }}</p> }
            <p class="text-slate-500">{{ o.city }}, {{ o.province }}</p>
            @if (o.notes) { <p class="mt-3 rounded-xl bg-amber-50 p-3 text-amber-800">{{ o.notes }}</p> }
          </section>
          <section class="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500">
            <p>Creado: {{ o.createdAt | date: 'd MMM y, HH:mm' }}</p>
            @if (o.paidAt) { <p>Pagado: {{ o.paidAt | date: 'd MMM y, HH:mm' }}</p> }
            @if (o.expiresAt) { <p class="text-amber-700">Reserva vence: {{ o.expiresAt | date: 'd MMM y, HH:mm' }}</p> }
          </section>
        </aside>
      </div>
    } @else {
      <div class="mt-6 h-80 animate-pulse rounded-2xl bg-white"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetail {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly statusLabel = ORDER_STATUS_LABEL;
  protected readonly statusClass = ORDER_STATUS_CLASS;
  protected readonly actionLabel: Partial<Record<OrderStatus, string>> = {
    paid: 'Marcar pagado',
    preparing: 'En preparación',
    shipped: 'Marcar enviado',
    delivered: 'Marcar entregado',
    cancelled: 'Cancelar pedido',
  };

  protected readonly order = signal<AdminOrder | null>(null);
  protected readonly transactions = signal<AdminTransaction[]>([]);
  protected readonly saving = signal(false);
  protected readonly transitions = computed(() => ORDER_TRANSITIONS[this.order()?.status ?? 'expired'] ?? []);
  protected readonly contactUrl = computed(() => {
    const o = this.order();
    if (!o) return '#';
    const phone = o.phone.replace(/\D/g, '').replace(/^0/, '593');
    return whatsAppUrl(`Hola ${o.customerName.split(' ')[0]}, te escribimos de Sale World Sale por tu pedido ${o.code}.`, phone);
  });

  constructor() {
    effect(() => this.load(this.id()));
  }

  protected setStatus(next: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    let note: string | undefined;
    if (next === 'cancelled') {
      if (!confirm(`¿Cancelar ${o.code}? El stock reservado vuelve al inventario.`)) return;
      note = prompt('Motivo (opcional):') ?? undefined;
    } else if (next === 'paid' && o.paymentMethod === 'whatsapp') {
      note = prompt('Referencia del pago (transferencia, efectivo…):') ?? undefined;
    }
    this.saving.set(true);
    this.api.setOrderStatus(o.id, next, note).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        if (next === 'cancelled' && o.paymentMethod === 'payphone' && o.paidAt)
          this.toast.info('Recuerda anular el cobro desde el panel de PayPhone.');
        this.saving.set(false);
        this.load(o.id);
      },
      error: (e: unknown) => {
        this.toast.error(httpErrorMessage(e));
        this.saving.set(false);
      },
    });
  }

  private load(id: string): void {
    this.api.order(id).subscribe((r) => {
      this.order.set(r.order);
      this.transactions.set(r.transactions);
    });
  }
}
