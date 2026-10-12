import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Pwa } from '@msh-core/pwa/pwa';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { PwaStatus } from './pwa-status';

describe('PwaStatus installation guidance', () => {
  const pwa = {
    mobilePlatform: 'android' as 'android' | 'ios' | null,
    installed: signal(false),
    online: signal(true),
    updateReady: signal(false),
    recoveryRequired: signal(false),
  };

  beforeEach(() => {
    pwa.mobilePlatform = 'android';
    pwa.installed.set(false);
    localStorage.removeItem(StorageKey.PwaInstallationDismissed);
    TestBed.configureTestingModule({
      providers: [...provideI18nTesting(), { provide: Pwa, useValue: pwa }],
    });
  });

  afterEach(() => localStorage.removeItem(StorageKey.PwaInstallationDismissed));

  it.each(['android', 'ios'] as const)(
    'keeps %s guidance visible until dismissal and remembers it across shell recreation',
    async (platform) => {
      pwa.mobilePlatform = platform;
      const fixture = TestBed.createComponent(PwaStatus);
      await fixture.whenStable();
      const store = TestBed.inject(ToastStore);
      const toast = store.toasts()[0];
      expect(toast.autoHide).toBe(false);
      expect(toast.closable).toBe(true);
      expect(toast.message).toContain(platform === 'ios' ? 'Safari' : 'Android');
      expect(toast.message).not.toContain(platform === 'ios' ? 'Android' : 'Safari');
      store.dismiss(toast.id);
      expect(TestBed.inject(BrowserStorage).get(StorageKey.PwaInstallationDismissed)).toBe('true');
      fixture.destroy();
      const nextFixture = TestBed.createComponent(PwaStatus);
      await nextFixture.whenStable();
      expect(store.toasts()).toHaveLength(0);
    },
  );

  it('does not show guidance on desktop', async () => {
    pwa.mobilePlatform = null;
    const fixture = TestBed.createComponent(PwaStatus);
    await fixture.whenStable();
    expect(TestBed.inject(ToastStore).toasts()).toHaveLength(0);
  });

  it('does not show guidance for an installed app', async () => {
    pwa.installed.set(true);
    const fixture = TestBed.createComponent(PwaStatus);
    await fixture.whenStable();
    expect(TestBed.inject(ToastStore).toasts()).toHaveLength(0);
  });
});
