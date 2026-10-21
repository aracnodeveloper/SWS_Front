import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartStore } from '../../shared/services/cart-store';
import { OrderApi } from '../../shared/services/order-api';
import { PublicOrder } from '../../shared/models/order';
import { Icon } from '../../shared/components/icon';
import { MoneyPipe } from '../../shared/pipes/money';
import { httpErrorMessage } from '../../shared/utils/http-error';
import { whatsAppUrl } from '../../shared/utils/whatsapp';

type State = 'loading' | 'approved' | 'rejected' | 'cancelled' | 'error';

/**
 * Página de retorno de PayPhone: llega con ?id=&clientTransactionId= (pago) o con
 * ?cancel=1&clientTransactionId=&token= (el cliente canceló). Confirma con el API,
 * que es quien habla con PayPhone; aquí nunca se decide si un pago fue aprobado.
 */
@Component({
  selector: 'app-payment-result',
  imports: [RouterLink, Icon, MoneyPipe],
  template: `
    <div class="container-page max-w-xl py-16 text-center">
      @switch (state()) {
        @case ('loading') {
          <div class="mx-auto size-14 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500"></div>
          <h1 class="mt-6 text-xl font-bold">Confirmando tu pago…</h1>
          <p class="mt-2 text-slate-500">No cierres esta ventana.</p>
        }
        @case ('approved') {
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><app-icon name="check" [size]="32" /></div>
          <h1 class="mt-6 text-2xl font-extrabold">¡Pago aprobado!</h1>
          <p class="mt-2 text-slate-500">Tu pedido <strong class="text-navy-900">{{ order()?.code }}</strong> por {{ order()?.total | money: true }} está confirmado. Te escribiremos por WhatsApp para coordinar la entrega.</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a [routerLink]="['/pedido', order()?.publicToken]" class="btn-primary">Ver mi pedido</a>
            <a routerLink="/catalogo" class="btn-outline">Seguir comprando</a>
          </div>
        }
        @case ('rejected') {
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-red-100 text-red-600"><app-icon name="close" [size]="32" /></div>
          <h1 class="mt-6 text-2xl font-extrabold">El pago no se completó</h1>
          <p class="mt-2 text-slate-500">No se realizó ningún cobro. Tu carrito sigue guardado para que lo intentes otra vez.</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a routerLink="/checkout" class="btn-primary">Intentar de nuevo</a>
            <a [href]="help" target="_blank" rel="noopener" class="btn-whatsapp"><app-icon name="whatsapp" [size]="18" /> Pedir por WhatsApp</a>
          </div>
        }
        @case ('cancelled') {
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-slate-100 text-slate-500"><app-icon name="arrow-left" [size]="30" /></div>
          <h1 class="mt-6 text-2xl font-extrabold">Pago cancelado</h1>
          <p class="mt-2 text-slate-500">Cancelaste el pago. Tu carrito sigue guardado.</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <a routerLink="/checkout" class="btn-primary">Volver al checkout</a>
            <a routerLink="/carrito" class="btn-outline">Ver carrito</a>
          </div>
        }
        @case ('error') {
          <div class="mx-auto grid size-16 place-items-center rounded-full bg-amber-100 text-amber-600"><app-icon name="alert" [size]="30" /></div>
          <h1 class="mt-6 text-2xl font-extrabold">No pudimos confirmar el pago</h1>
          <p class="mt-2 text-slate-500">{{ message() }}</p>
          <p class="mt-2 text-sm text-slate-500">Si se debitó el valor, escríbenos con tu número de pedido y lo revisamos de inmediato.</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" class="btn-primary" (click)="ngOnInit()"><app-icon name="refresh" [size]="18" /> Reintentar</button>
            <a [href]="help" target="_blank" rel="noopener" class="btn-whatsapp"><app-icon name="whatsapp" [size]="18" /> Escríbenos</a>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentResult implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrderApi);
  private readonly cart = inject(CartStore);

  protected readonly state = signal<State>('loading');
  protected readonly order = signal<PublicOrder | null>(null);
  protected readonly message = signal('');
  protected readonly help = whatsAppUrl('Hola Sale World Sale, tuve un problema al pagar mi pedido.');

  ngOnInit(): void {
    this.state.set('loading');
    const q = this.route.snapshot.queryParamMap;
    const clientTxId = q.get('clientTransactionId') ?? '';
    const id = Number(q.get('id'));

    if (q.get('cancel') === '1') {
      this.orders.cancelPayment(clientTxId, q.get('token') ?? '').subscribe({
        next: () => this.state.set('cancelled'),
        error: () => this.state.set('cancelled'),
      });
      return;
    }

    if (!clientTxId || !Number.isFinite(id) || id <= 0) {
      this.message.set('El enlace de retorno no es válido.');
      this.state.set('error');
      return;
    }

    this.orders.confirmPayPhone(id, clientTxId).subscribe({
      next: (order) => {
        this.order.set(order);
        if (['paid', 'preparing', 'shipped', 'delivered'].includes(order.status)) {
          this.cart.clear();
          sessionStorage.removeItem('sws.pendingOrder');
          this.state.set('approved');
        } else if (order.status === 'pending_payment') {
          this.message.set('Estamos verificando el pago con el banco. Te confirmaremos por WhatsApp.');
          this.state.set('error');
        } else {
          this.state.set('rejected');
        }
      },
      error: (err: unknown) => {
        this.message.set(httpErrorMessage(err));
        this.state.set('error');
      },
    });
  }
}
