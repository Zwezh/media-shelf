import { computed, Directive, inject, input } from '@angular/core';
import { AuthSession } from '@msh-core/auth/auth-session';

@Directive({
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'disabled() ? "" : null',
  },
  selector: '[mshRequiresAuth]',
})
export class RequiresAuth {
  readonly mshRequiresAuth = input(false);
  private readonly session = inject(AuthSession);
  protected readonly disabled = computed(() => this.mshRequiresAuth() || !this.session.isAuthenticated());
}
