import { signal } from '@angular/core';
import { Pwa } from '@msh-core/pwa/pwa';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { PwaSettings } from './pwa-settings';

describe('PwaSettings', () => {
  it('shows manual mobile installation instructions without authentication or an install event', async () => {
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        {
          provide: Pwa,
          useValue: { installed: signal(false), canInstall: signal(false), installError: signal(false), installing: signal(false) },
        },
      ],
    });
    const fixture = TestBed.createComponent(PwaSettings);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toBe('Install MediaShelf');
    expect(element.querySelector('summary')?.textContent).toBe('How to install');
    expect(element.textContent).toContain('Safari');
    expect(element.textContent).toContain('Android');
    expect(element.querySelector('button')).toBeNull();
  });
});
