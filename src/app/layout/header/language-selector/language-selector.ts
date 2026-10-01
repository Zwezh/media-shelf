import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { isSupportedLanguage, Language } from '@msh-core/i18n/language';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  selector: 'msh-language-selector',
  styleUrl: './language-selector.scss',
  template: `
    <label class="language-selector">
      <span class="language-selector__label">{{ 'header.language.label' | translate }}</span>
      <select
        [attr.aria-label]="'header.language.label' | translate"
        [attr.title]="'header.language.label' | translate"
        [value]="language.language()"
        (change)="changeLanguage($event)"
      >
        @for (option of language.supportedLanguages; track option) {
          <option [lang]="option" [value]="option">{{ option.toUpperCase() }}</option>
        }
      </select>
    </label>
  `,
})
export class LanguageSelector {
  protected readonly language = inject(Language);

  protected changeLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value;
    if (isSupportedLanguage(language)) void this.language.select(language);
  }
}
