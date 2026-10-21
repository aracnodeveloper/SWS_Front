import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from './shared/components/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost],
  template: `<router-outlet /><app-toast-host />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
