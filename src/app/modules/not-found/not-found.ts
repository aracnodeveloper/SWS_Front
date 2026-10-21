import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container-page py-24 text-center">
      <img src="/brand/sws-isotipo.webp" alt="" width="120" height="98" class="mx-auto h-20 w-auto opacity-80" />
      <h1 class="mt-6 text-3xl font-extrabold">Página no encontrada</h1>
      <p class="mt-2 text-slate-500">El enlace que seguiste no existe o cambió.</p>
      <a routerLink="/catalogo" class="btn-primary mt-8">Ver catálogo</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  constructor() {
    // En SSR responde 404 real (no indexar páginas inexistentes).
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}
