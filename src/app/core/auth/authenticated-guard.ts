import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthSession } from './auth-session';

export const authenticatedGuard: CanActivateFn = (route) => {
  if (inject(AuthSession).isAuthenticated()) return true;
  return inject(Router).createUrlTree([route.data['authRedirectTo'] ?? '/gallery/movies'], { queryParams: route.queryParams });
};
