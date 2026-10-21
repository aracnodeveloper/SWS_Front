import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSession } from '../../../shared/services/auth-session';
import { httpErrorMessage } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="grid min-h-dvh place-items-center bg-navy-900 p-4">
      <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <img src="/brand/sws-logo-light.webp" alt="Sale World Sale" width="120" height="120" class="mx-auto size-28" />
        <h1 class="mt-4 text-center text-xl font-bold">Panel de administración</h1>
        @if (reason() === 'session') { <p class="mt-3 rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-700">Tu sesión expiró. Ingresa de nuevo.</p> }
        <div class="mt-6 space-y-4">
          <div><label class="field-label" for="email">Correo</label><input id="email" type="email" class="field" formControlName="email" autocomplete="username" /></div>
          <div><label class="field-label" for="password">Contraseña</label><input id="password" type="password" class="field" formControlName="password" autocomplete="current-password" /></div>
        </div>
        @if (error()) { <p class="mt-4 text-sm text-red-600" role="alert">{{ error() }}</p> }
        <button type="submit" class="btn-primary mt-6 w-full" [disabled]="form.invalid || loading()">{{ loading() ? 'Ingresando…' : 'Ingresar' }}</button>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogin {
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);

  readonly reason = input<string | undefined>();

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (s) => {
        if (!s.roles.includes('Admin')) {
          this.auth.logout();
          this.error.set('Tu cuenta no tiene acceso al panel.');
          this.loading.set(false);
          return;
        }
        void this.router.navigateByUrl('/admin');
      },
      error: (e: unknown) => {
        this.error.set(httpErrorMessage(e, 'No se pudo iniciar sesión.'));
        this.loading.set(false);
      },
    });
  }
}
