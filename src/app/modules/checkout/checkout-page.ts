import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartStore } from '../../shared/services/cart-store';
import { OrderApi } from '../../shared/services/order-api';
import { ToastService } from '../../shared/services/toast';
import { CartSummary } from '../../shared/components/cart-summary';
import { Icon } from '../../shared/components/icon';
import { MediaPipe } from '../../shared/pipes/media';
import { MoneyPipe } from '../../shared/pipes/money';
import { PaymentMethod } from '../../shared/models/order';
import { PROVINCES } from '../../shared/config/store';
import { estimateTotals } from '../../shared/utils/pricing';
import { httpErrorMessage } from '../../shared/utils/http-error';

const PENDING_KEY = 'sws.pendingOrder';

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, CartSummary, Icon, MediaPipe, MoneyPipe],
  template: `
    <div class="container-page py-10">
      <h1 class="section-title">Finalizar compra</h1>
      <div class="section-bar"></div>

      @if (cart.isEmpty()) {
        <div class="mt-10 rounded-3xl border border-dashed border-brand-200 p-14 text-center">
          <p class="font-semibold">No hay productos en tu carrito.</p>
          <a routerLink="/catalogo" class="btn-primary mt-6">Ver catálogo</a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]" novalidate>
          <div class="space-y-6">
            <fieldset class="card p-6">
              <legend class="px-1 text-lg font-bold">1. Tus datos</legend>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="field-label" for="customerName">Nombre completo</label>
                  <input id="customerName" class="field" formControlName="customerName" autocomplete="name" />
                  @if (invalid('customerName')) { <p class="field-error">Ingresa tu nombre.</p> }
                </div>
                <div>
                  <label class="field-label" for="email">Correo</label>
                  <input id="email" type="email" class="field" formControlName="email" autocomplete="email" />
                  @if (invalid('email')) { <p class="field-error">Ingresa un correo válido.</p> }
                </div>
                <div>
                  <label class="field-label" for="phone">Celular (WhatsApp)</label>
                  <input id="phone" type="tel" class="field" formControlName="phone" autocomplete="tel" placeholder="09XXXXXXXX" />
                  @if (invalid('phone')) { <p class="field-error">Ingresa un número válido.</p> }
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label" for="documentId">Cédula o RUC <span class="font-normal text-slate-400">(para tu factura)</span></label>
                  <input id="documentId" inputmode="numeric" class="field" formControlName="documentId" maxlength="13" />
                  @if (invalid('documentId')) { <p class="field-error">Debe tener 10 dígitos (cédula) o 13 (RUC).</p> }
                </div>
              </div>
            </fieldset>

            <fieldset class="card p-6">
              <legend class="px-1 text-lg font-bold">2. Entrega</legend>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="field-label" for="province">Provincia</label>
                  <select id="province" class="field" formControlName="province">
                    <option value="" disabled>Selecciona</option>
                    @for (p of provinces; track p) { <option [value]="p">{{ p }}</option> }
                  </select>
                  @if (invalid('province')) { <p class="field-error">Selecciona tu provincia.</p> }
                </div>
                <div>
                  <label class="field-label" for="city">Ciudad</label>
                  <input id="city" class="field" formControlName="city" autocomplete="address-level2" />
                  @if (invalid('city')) { <p class="field-error">Ingresa tu ciudad.</p> }
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label" for="address">Dirección</label>
                  <input id="address" class="field" formControlName="address" autocomplete="street-address" placeholder="Calle principal, número y secundaria" />
                  @if (invalid('address')) { <p class="field-error">Ingresa tu dirección.</p> }
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label" for="addressReference">Referencia <span class="font-normal text-slate-400">(opcional)</span></label>
                  <input id="addressReference" class="field" formControlName="addressReference" placeholder="Edificio, color de casa, junto a…" />
                </div>
                <div class="sm:col-span-2">
                  <label class="field-label" for="notes">Notas del pedido <span class="font-normal text-slate-400">(opcional)</span></label>
                  <textarea id="notes" rows="2" class="field" formControlName="notes"></textarea>
                </div>
              </div>
            </fieldset>

            <fieldset class="card p-6">
              <legend class="px-1 text-lg font-bold">3. Forma de pago</legend>
              <div class="mt-4 grid gap-3">
                @if (payPhoneEnabled()) {
                  <label class="flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition"
                         [class]="method() === 'payphone' ? 'border-brand-500 bg-brand-50/60 ring-4 ring-brand-100' : 'border-brand-100 hover:border-brand-300'">
                    <input type="radio" formControlName="paymentMethod" value="payphone" class="mt-1 accent-brand-500" />
                    <span class="flex-1">
                      <span class="flex items-center gap-2 font-semibold"><app-icon name="lock" [size]="16" class="text-brand-500" /> Tarjeta de crédito o débito</span>
                      <span class="mt-0.5 block text-sm text-slate-500">Pago seguro con PayPhone (Visa, Mastercard, Diners…). Te llevamos a la pasarela y vuelves aquí.</span>
                    </span>
                  </label>
                }
                <label class="flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition"
                       [class]="method() === 'whatsapp' ? 'border-whatsapp bg-emerald-50/60 ring-4 ring-emerald-100' : 'border-brand-100 hover:border-brand-300'">
                  <input type="radio" formControlName="paymentMethod" value="whatsapp" class="mt-1 accent-emerald-500" />
                  <span class="flex-1">
                    <span class="flex items-center gap-2 font-semibold"><app-icon name="whatsapp" [size]="16" class="text-whatsapp" /> Pedido por WhatsApp</span>
                    <span class="mt-0.5 block text-sm text-slate-500">Reservamos tu stock y coordinamos por WhatsApp el pago (transferencia o efectivo) y la entrega.</span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <aside class="card h-fit p-6 lg:sticky lg:top-24">
            <h2 class="text-lg font-bold">Tu pedido</h2>
            <ul class="mt-4 max-h-72 space-y-3 overflow-y-auto">
              @for (item of cart.items(); track item.productId) {
                <li class="flex items-center gap-3">
                  <div class="relative size-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                    <img [src]="item.imageUrl | media" [alt]="item.name" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" />
                    <span class="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-navy-900 px-1 text-[10px] font-bold text-white">{{ item.quantity }}</span>
                  </div>
                  <span class="line-clamp-2 flex-1 text-sm">{{ item.name }}</span>
                  <span class="text-sm font-semibold">{{ item.price * item.quantity | money: true }}</span>
                </li>
              }
            </ul>
            <div class="mt-5 border-t border-brand-100 pt-5">
              <app-cart-summary [totals]="totals()" [vatIncluded]="config()?.pricesIncludeVat ?? true" />
            </div>
            @if (error()) {
              <p class="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error() }}</p>
            }
            <button type="submit" class="mt-6 w-full" [class]="method() === 'whatsapp' ? 'btn-whatsapp' : 'btn-primary'" [disabled]="submitting()">
              @if (submitting()) { Procesando… }
              @else if (method() === 'whatsapp') { <app-icon name="whatsapp" [size]="18" /> Confirmar pedido por WhatsApp }
              @else { <app-icon name="lock" [size]="18" /> Pagar {{ totals().total | money: true }} }
            </button>
            <p class="mt-3 text-center text-xs text-slate-400">Al confirmar aceptas que te contactemos para coordinar la entrega.</p>
          </aside>
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  protected readonly cart = inject(CartStore);
  private readonly orders = inject(OrderApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly provinces = PROVINCES;
  protected readonly config = toSignal(this.orders.config(), { initialValue: null });
  protected readonly payPhoneEnabled = computed(() => this.config()?.paymentMethods.includes('payphone') ?? false);
  protected readonly totals = computed(() => estimateTotals(this.cart.itemsTotal(), this.config()));
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{7,15}$/)]],
    documentId: ['', [Validators.required, Validators.pattern(/^(\d{10}|\d{13})$/)]],
    province: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(250)]],
    addressReference: [''],
    notes: [''],
    paymentMethod: ['whatsapp' as PaymentMethod, Validators.required],
  });

  protected readonly method = toSignal(this.form.controls.paymentMethod.valueChanges, {
    initialValue: this.form.controls.paymentMethod.value,
  });

  constructor() {
    // Tarjeta por defecto en cuanto sabemos que PayPhone está habilitado.
    effect(() => {
      if (this.payPhoneEnabled() && !this.form.controls.paymentMethod.dirty)
        this.form.controls.paymentMethod.setValue('payphone');
    });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos marcados.');
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.orders
      .checkout({
        ...value,
        items: this.cart.items().map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })
      .subscribe({
        next: (res) => {
          if (res.redirectUrl) {
            // El carrito se vacía al confirmar el pago (si el cliente cancela, lo conserva).
            sessionStorage.setItem(PENDING_KEY, res.publicToken);
            window.location.href = res.redirectUrl;
            return;
          }
          this.cart.clear();
          this.toast.success(`Pedido ${res.orderCode} reservado`);
          void this.router.navigate(['/pedido', res.publicToken], { queryParams: { nuevo: 1 } });
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.error.set(httpErrorMessage(err, 'No pudimos registrar tu pedido. Intenta de nuevo.'));
        },
      });
  }
}
