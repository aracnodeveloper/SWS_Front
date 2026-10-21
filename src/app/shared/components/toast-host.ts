import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../services/toast';
import { Icon } from './icon';

@Component({
  selector: 'app-toast-host',
  imports: [Icon],
  template: `
    <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex max-w-md animate-toast-in items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg"
          [class.bg-navy-900]="t.kind === 'info' || t.kind === 'success'"
          [class.bg-red-600]="t.kind === 'error'"
        >
          <app-icon [name]="t.kind === 'error' ? 'alert' : 'check'" [size]="18" />
          <span>{{ t.message }}</span>
          <button type="button" class="ml-2 opacity-70 hover:opacity-100" (click)="toasts.dismiss(t.id)" aria-label="Cerrar">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
