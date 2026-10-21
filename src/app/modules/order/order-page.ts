import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderApi } from '../../shared/services/order-api';
import { PublicOrder } from '../../shared/models/order';
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from '../../shared/config/order-status';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';

const STEPS = [
  { status: 'paid', label: 'Confirmado' },
  { status: 'preparing', label: 'En preparación' },
  { status: 'shipped', label: 'Enviado' },
  { status: 'delivered', label: 'Entregado' },
];

@Component({
  selector: 'app-order-page',
  imports: [RouterLink, DatePipe, Icon, MediaPipe, MoneyPipe],
  template: `
    <div class="container-page max-w-3xl py-10">
      @if (order(); as o) {
        @if (nuevo() && o.status === 'pending_confirmation') {
          <div class="mb-6 rounded-3xl bg-emerald-50 p-6 text-center">
            <h1 class="text-2xl font-extrabold text-navy-900">¡Pedido {{ o.code }} reservado!</h1>
            <p class="mt-2 text-slate-600">Último paso: envíanos el pedido por WhatsApp para confirmar el pago y la entrega. Guardamos tu stock por 24 horas.</p>
            @if (o.whatsAppUrl) {
              <a [href]="o.whatsAppUrl" target="_blank" rel="noopener" class="btn-whatsapp mt-5 px-8 py-4 text-base"><app-icon name="whatsapp" [size]="20" /> Enviar pedido por WhatsApp</a>
            }
          </div>
        }

        <div class="card p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-wider text-slate-500">Pedido</p>
              <h2 class="text-2xl font-extrabold">{{ o.code }}</h2>
              <p class="text-sm text-slate-500">{{ o.createdAt | date: 'd MMM y, HH:mm' }} · {{ o.city }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-sm font-semibold" [class]="statusClass()">{{ statusLabel() }}</span>
          </div>

          @if (stepIndex() >= 0) {
            <ol class="mt-8 grid grid-cols-4 gap-2">
              @for (s of steps; track s.status; let i = $index) {
                <li class="text-center">
                  <div class="h-1.5 rounded-full" [class]="i <= stepIndex() ? 'bg-brand-500' : 'bg-brand-100'"></div>
                  <span class="mt-2 block text-xs font-medium" [class]="i <= stepIndex() ? 'text-navy-900' : 'text-slate-400'">{{ s.label }}</span>
                </li>
              }
            </ol>
          }

          <ul class="mt-8 divide-y divide-brand-100">
            @for (i of o.items; track i.productName) {
              <li class="flex items-center gap-4 py-3">
                <div class="relative size-16 shrink-0 overflow-hidden rounded-xl bg-brand-50"><img [src]="i.imageUrl | media" [alt]="i.productName" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" /></div>
                <span class="flex-1 text-sm"><span class="font-semibold">{{ i.productName }}</span><span class="block text-slate-500">{{ i.quantity }} × {{ i.unitPrice | money }}</span></span>
                <span class="font-semibold">{{ i.lineTotal | money: true }}</span>
              </li>
            }
          </ul>
          <dl class="mt-4 space-y-1.5 border-t border-brand-100 pt-4 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Envío</dt><dd>{{ o.shipping > 0 ? (o.shipping | money: true) : 'Por coordinar' }}</dd></div>
            <div class="flex justify-between text-xs text-slate-400"><dt>IVA incluido</dt><dd>{{ o.vat | money: true }}</dd></div>
            <div class="flex justify-between text-lg font-bold"><dt>Total</dt><dd>{{ o.total | money: true }}</dd></div>
          </dl>

          @if (!nuevo() && o.whatsAppUrl) {
            <a [href]="o.whatsAppUrl" target="_blank" rel="noopener" class="btn-whatsapp mt-6 w-full"><app-icon name="whatsapp" [size]="18" /> Confirmar por WhatsApp</a>
          }
        </div>
        <div class="mt-6 text-center"><a routerLink="/catalogo" class="btn-ghost">Seguir comprando</a></div>
      } @else if (error()) {
        <div class="py-16 text-center">
          <h1 class="text-2xl font-bold">No encontramos este pedido</h1>
          <a routerLink="/" class="btn-primary mt-6">Ir al inicio</a>
        </div>
      } @else {
        <div class="h-96 animate-pulse rounded-3xl bg-brand-50"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPage {
  private readonly orders = inject(OrderApi);

  readonly token = input.required<string>();
  readonly nuevo = input<string | undefined>();

  protected readonly steps = STEPS;
  protected readonly order = signal<PublicOrder | null>(null);
  protected readonly error = signal(false);
  protected readonly statusLabel = computed(() => (this.order() ? ORDER_STATUS_LABEL[this.order()!.status] : ''));
  protected readonly statusClass = computed(() => (this.order() ? ORDER_STATUS_CLASS[this.order()!.status] : ''));
  protected readonly stepIndex = computed(() => STEPS.findIndex((s) => s.status === this.order()?.status));

  constructor() {
    effect((onCleanup) => {
      const sub = this.orders.publicOrder(this.token()).subscribe({
        next: (o) => this.order.set(o),
        error: () => this.error.set(true),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }
}
