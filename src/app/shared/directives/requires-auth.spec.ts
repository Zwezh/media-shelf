import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@msh-core/auth/auth-session';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { RequiresAuth } from './requires-auth';

@Component({
  imports: [RequiresAuth],
  template: `<button type="button" [mshRequiresAuth]="busy()">Protected</button>`,
})
class TestHost {
  readonly busy = signal(false);
}

describe('RequiresAuth', () => {
  beforeEach(resetTestAuthStorage);

  it('disables the host while signed out or busy', () => {
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting()] });
    const fixture = TestBed.createComponent(TestHost);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');

    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);

    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });
});
