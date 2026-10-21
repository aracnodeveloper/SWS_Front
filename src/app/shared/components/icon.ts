import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Íconos de trazo (24×24, estilo Lucide) inline: sin dependencias ni requests extra. */
const PATHS: Record<string, string> = {
  cart: 'M6 6h15l-1.5 9h-12zM6 6 5 3H2m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  search: 'm21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'm5 12 5 5L20 7',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10m-3-10 2 2 4-4',
  truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4m10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  box: 'm21 8-9-5-9 5 9 5zM3 8v8l9 5 9-5V8M12 13v8',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  'arrow-left': 'M19 12H5m6 6-6-6 6-6',
  mail: 'M3 5h18v14H3zm0 0 9 7 9-7',
  lock: 'M6 11h12v10H6zm2 0V7a4 4 0 1 1 8 0v4',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  package: 'm16.5 9.4-9-5.2M21 16V8l-9-5-9 5v8l9 5zM3.3 7 12 12l8.7-5M12 22V12',
  tag: 'M3 3h8l10 10-8 8L3 11zm4 4h.01',
  alert: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  image: 'M3 3h18v18H3zm5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m13 5-5-5L5 21',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z',
  orders: 'M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01',
  external: 'M14 3h7v7M10 14 21 3M21 14v7H3V3h7',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
};

/** WhatsApp va relleno (marca). */
const WHATSAPP =
  'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2m5.4 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 2 1.2 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      [attr.stroke]="filled() ? 'none' : 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  host: { class: 'inline-flex shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);

  protected readonly filled = computed(() => this.name() === 'whatsapp');
  protected readonly path = computed(() => (this.filled() ? WHATSAPP : PATHS[this.name()] ?? ''));
}
