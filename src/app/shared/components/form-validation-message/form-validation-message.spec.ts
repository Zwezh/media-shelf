import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { FormValidationMessage, type ValidationFieldState } from './form-validation-message';

describe('FormValidationMessage', () => {
  it('renders the validator message only after an invalid field is touched', async () => {
    const touched = signal(false);
    const field: ValidationFieldState = {
      errors: signal([{ kind: 'required', message: 'movieEditor.validation.required' }]),
      invalid: signal(true),
      touched,
    };
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(FormValidationMessage);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('messageId', 'field-error');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('small')).toBeNull();

    touched.set(true);
    await fixture.whenStable();

    const message = (fixture.nativeElement as HTMLElement).querySelector('small');
    expect(message?.id).toBe('field-error');
    expect(message?.textContent).toContain('Required field.');
  });

  it('maps built-in error kinds when a validator has no custom message', async () => {
    const field: ValidationFieldState = {
      errors: signal([{ kind: 'email' }]),
      invalid: signal(true),
      touched: signal(true),
    };
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(FormValidationMessage);
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('messageId', 'email-error');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Enter a valid email address.');
  });
});
