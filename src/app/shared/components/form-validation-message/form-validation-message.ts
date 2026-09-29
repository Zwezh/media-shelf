import { Component, computed, input, type Signal } from '@angular/core';
import { type ValidationError } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';

export type ValidationFieldState = {
  readonly errors: Signal<readonly ValidationError[]>;
  readonly invalid: Signal<boolean>;
  readonly touched: Signal<boolean>;
};

const VALIDATION_MESSAGE_KEYS: Readonly<Record<string, string>> = {
  email: 'common.validation.email',
  max: 'common.validation.max',
  maxDate: 'common.validation.maxDate',
  maxLength: 'common.validation.maxLength',
  min: 'common.validation.min',
  minDate: 'common.validation.minDate',
  minLength: 'common.validation.minLength',
  parse: 'common.validation.parse',
  pattern: 'common.validation.pattern',
  range: 'common.validation.range',
  required: 'common.validation.required',
  standardSchema: 'common.validation.pattern',
};

@Component({
  imports: [TranslatePipe],
  selector: 'msh-form-validation-message',
  styles: `
    :host {
      display: contents;
    }

    .form-validation-message {
      color: var(--color-danger);
      font: var(--text-body-sm);
    }
  `,
  template: `
    @if (field().touched() && field().invalid()) {
      <small [id]="messageId()" class="form-validation-message" role="alert">{{ messageKey() | translate }}</small>
    }
  `,
})
export class FormValidationMessage {
  readonly field = input.required<ValidationFieldState>();
  readonly messageId = input.required<string>();
  readonly fallbackKey = input('common.validation.value');

  protected readonly messageKey = computed(() => {
    const error = this.field().errors()[0];
    if (!error) return this.fallbackKey();
    return (typeof error.message === 'string' && error.message) || VALIDATION_MESSAGE_KEYS[error.kind] || this.fallbackKey();
  });
}
