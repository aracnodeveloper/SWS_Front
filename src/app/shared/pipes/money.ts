import { Pipe, PipeTransform } from '@angular/core';

const whole = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const exact = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** $45 en vitrina (como el catálogo) y $45.00 en totales: `price | money` / `total | money: true`. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, cents = false): string {
    if (value == null) return '';
    return `$${(cents ? exact : whole).format(value)}`;
  }
}
