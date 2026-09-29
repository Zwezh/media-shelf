import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { ToastStore } from '@msh-shared/services/toast-store';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { AuthApi } from '../auth-api';
import { AuthSession } from '../auth-session';
import { AuthDialog } from './auth-dialog';

describe('AuthDialog', () => {
  beforeEach(resetTestAuthStorage);

  it('implements the reduced sign-in prototype and starts the session', async () => {
    const signIn = vi.fn(() => of(TEST_ACCESS_TOKEN));
    const close = vi.fn();
    const success = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: AuthApi, useValue: { signIn } },
        { provide: FloatingPanelRef, useValue: { close } },
        { provide: ToastStore, useValue: { error: vi.fn(), success } },
      ],
    });
    const fixture = TestBed.createComponent(AuthDialog);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Authorize access');
    expect(element.textContent).not.toContain('Forgot key');
    expect(element.textContent).not.toContain('Remember workstation authorization');

    const input = element.querySelector<HTMLInputElement>('#auth-secret-key')!;
    input.value = '  secret  ';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new SubmitEvent('submit'));
    await fixture.whenStable();

    expect(signIn).toHaveBeenCalledWith('secret');
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(true);
    expect(success).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledWith(true);
  });

  it('shows error feedback and keeps the dialog open after a rejected sign-in', async () => {
    const error = vi.fn();
    const close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: AuthApi, useValue: { signIn: () => throwError(() => new Error('Unauthorized')) } },
        { provide: FloatingPanelRef, useValue: { close } },
        { provide: ToastStore, useValue: { error, success: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(AuthDialog);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('#auth-secret-key')!;
    input.value = 'wrong';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new SubmitEvent('submit'));
    await fixture.whenStable();

    expect(error).toHaveBeenCalledOnce();
    expect(close).not.toHaveBeenCalled();
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });
});
