import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiService } from '../services/api';
import { AuthSession } from '../services/auth-session';

/** Añade el Bearer del admin solo a requests del API; 401 → cierra sesión. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const auth = inject(AuthSession);
  const token = auth.token;

  if (token && api.isApiRequest(req.url)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && token && !req.url.includes('/auth/login')) {
        auth.logout('session');
      }
      return throwError(() => err);
    }),
  );
};
