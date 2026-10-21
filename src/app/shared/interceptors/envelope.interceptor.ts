import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

interface ApiEnvelope {
  code: number;
  message: string;
  data: unknown;
}

function isEnvelope(body: unknown): body is ApiEnvelope {
  return (
    !!body &&
    typeof body === 'object' &&
    'code' in body &&
    'message' in body &&
    'data' in body &&
    typeof (body as { code: unknown }).code === 'number'
  );
}

/**
 * Desenvuelve el sobre estándar del backend `{ code, message, data }` y entrega
 * directamente `data` (mismo contrato que VE_Front). Los errores conservan el sobre
 * en `error` y se leen con httpErrorMessage().
 */
export const envelopeInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    map((event) =>
      event instanceof HttpResponse && isEnvelope(event.body) ? event.clone({ body: event.body.data }) : event,
    ),
  );
