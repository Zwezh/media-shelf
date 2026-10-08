import { effect, inject, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession } from './auth-session';

export function authenticatedRouteInitializer(): void {
  const session = inject(AuthSession);
  const router = inject(Router);
  effect(() => {
    const authenticated = session.isAuthenticated();
    const navigation = router.lastSuccessfulNavigation();
    if (authenticated || !navigation) return;
    let route = router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const redirectTo: unknown = route.data['authRedirectTo'];
    if (typeof redirectTo === 'string') {
      void untracked(() => router.navigate([redirectTo], { queryParams: route.queryParams, replaceUrl: true }));
    }
  });
}
