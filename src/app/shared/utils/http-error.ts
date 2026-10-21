import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje legible del sobre { code, message, data } del API, o uno genérico. */
export function httpErrorMessage(err: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No hay conexión con el servidor.';
    if (err.status === 429) return 'Demasiados intentos. Espera un minuto y vuelve a intentar.';
    const message = (err.error as { message?: unknown } | null)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
