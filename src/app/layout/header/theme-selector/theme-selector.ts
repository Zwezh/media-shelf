import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Theme } from '@msh-core/theme/theme';
import { Icon, IconName } from '@msh-shared/components/icon/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  selector: 'msh-theme-selector',
  styleUrl: './theme-selector.scss',
  template: `
    <button
      class="btn btn-secondary btn-sm theme-selector__button"
      type="button"
      role="checkbox"
      [class.theme-selector__button--dark]="theme.preference() === 'dark'"
      [attr.aria-checked]="theme.checkboxState()"
      [attr.aria-label]="labelKey() | translate"
      [attr.title]="labelKey() | translate"
      (click)="theme.cycle()"
    >
      <msh-icon [name]="iconName()" [size]="18" />
    </button>
  `,
})
export class ThemeSelector {
  protected readonly theme = inject(Theme);
  protected readonly labelKey = computed(() => `header.theme.${this.theme.preference()}`);
  protected readonly iconName = computed<IconName>(() => {
    switch (this.theme.preference()) {
      case 'light':
        return 'sun';
      case 'dark':
        return 'moon';
      default:
        return 'monitor';
    }
  });
}
