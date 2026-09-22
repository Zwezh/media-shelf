import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type PageStatusKind = 'loading' | 'error';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-page-status',
  styleUrl: './page-status.scss',
  template: `
    <div class="page-status page-status--{{ kind() }}" [attr.role]="role()" [attr.aria-live]="ariaLive()">
      @if (kind() === 'loading') {
        <span class="page-status__spinner" aria-hidden="true"></span>
      }
      <p>{{ messageKey() | translate }}</p>
    </div>
  `,
})
export class PageStatus {
  readonly kind = input<PageStatusKind>('loading');
  readonly messageKey = input.required<string>();
  protected readonly role = computed(() => (this.kind() === 'error' ? 'alert' : 'status'));
  protected readonly ariaLive = computed(() => (this.kind() === 'error' ? 'assertive' : 'polite'));
}
