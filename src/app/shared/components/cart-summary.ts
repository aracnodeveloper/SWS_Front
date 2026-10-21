import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MoneyPipe } from '../pipes/money';
import { Totals } from '../utils/pricing';

@Component({
  selector: 'app-cart-summary',
  imports: [MoneyPipe],
  template: `
    @let t = totals();
    <dl class="space-y-2 text-sm">
      <div class="flex justify-between"><dt class="text-slate-500">Productos</dt><dd class="font-medium">{{ t.itemsTotal | money: true }}</dd></div>
      <div class="flex justify-between">
        <dt class="text-slate-500">Envío</dt>
        <dd class="font-medium">{{ t.shipping > 0 ? (t.shipping | money: true) : 'Por coordinar' }}</dd>
      </div>
      <div class="flex justify-between text-xs text-slate-400"><dt>{{ vatIncluded() ? 'IVA incluido' : 'IVA' }}</dt><dd>{{ t.vat | money: true }}</dd></div>
      <div class="flex justify-between border-t border-brand-100 pt-3 text-base">
        <dt class="font-semibold">Total</dt><dd class="text-xl font-bold text-navy-900">{{ t.total | money: true }}</dd>
      </div>
    </dl>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummary {
  readonly totals = input.required<Totals>();
  readonly vatIncluded = input(true);
}
