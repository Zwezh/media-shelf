import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from './auth-session';

export const authenticatedGuard: CanActivateFn = async (route) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  if (!session.isAuthenticated()) await firstValueFrom(session.restore());
  if (session.isAuthenticated()) return true;
  return router.createUrlTree([route.data['authRedirectTo'] ?? '/gallery/movies'], { queryParams: route.queryParams });
};
