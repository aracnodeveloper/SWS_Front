import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { CartDrawer } from './cart-drawer';
import { Icon } from '../../shared/components/icon';
import { whatsAppUrl } from '../../shared/utils/whatsapp';

@Component({
  selector: 'app-shop-layout',
  imports: [RouterOutlet, SiteHeader, SiteFooter, CartDrawer, Icon],
  template: `
    <div class="flex min-h-dvh flex-col">
      <app-site-header />
      <main class="flex-1"><router-outlet /></main>
      <app-site-footer />
    </div>
    <app-cart-drawer />
    <a
      [href]="whatsApp"
      target="_blank"
      rel="noopener"
      class="group fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/20 transition duration-300 hover:scale-110 hover:-rotate-6"
      aria-label="Escríbenos por WhatsApp"
    >
      <span class="absolute inset-0 rounded-full bg-whatsapp motion-safe:animate-ping-slow"></span>
      <app-icon name="whatsapp" [size]="30" class="relative" />
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopLayout {
  protected readonly whatsApp = whatsAppUrl('Hola Sale World Sale, quiero información sobre sus productos.');
}
