import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../services/auth-session';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthSession);
  return auth.isAdmin() ? true : inject(Router).createUrlTree(['/admin/login']);
};
