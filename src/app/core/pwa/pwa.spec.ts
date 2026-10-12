import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { Pwa } from './pwa';

describe('Pwa', () => {
  const versions = new Subject<VersionEvent>();
  const unrecoverable = new Subject<{ reason: string }>();
  let browser: EventTarget & {
    navigator: { onLine: boolean; standalone: boolean; userAgent: string; platform: string; maxTouchPoints: number };
    document: EventTarget & { visibilityState: string };
    location: { reload: ReturnType<typeof vi.fn> };
  };
  let checkForUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    browser = Object.assign(new EventTarget(), {
      navigator: { onLine: true, standalone: false, userAgent: '', platform: '', maxTouchPoints: 0 },
      document: Object.assign(new EventTarget(), { visibilityState: 'visible' }),
      location: { reload: vi.fn() },
    });
    checkForUpdate = vi.fn().mockResolvedValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: browser } },
        { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates: versions, unrecoverable, checkForUpdate } },
      ],
    });
  });

  it.each([
    ['Mozilla/5.0 (Linux; Android 15)', 'android'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'ios'],
    ['Mozilla/5.0 (Windows NT 10.0)', null],
  ] as const)('detects installation guidance for %s', (userAgent, expected) => {
    browser.navigator.userAgent = userAgent;
    expect(TestBed.inject(Pwa).mobilePlatform).toBe(expected);
  });

  it('recognizes iPads using the desktop user agent', () => {
    browser.navigator.platform = 'MacIntel';
    browser.navigator.maxTouchPoints = 5;
    expect(TestBed.inject(Pwa).mobilePlatform).toBe('ios');
  });

  it('tracks connectivity and removes listeners when destroyed', () => {
    const pwa = TestBed.inject(Pwa);
    browser.dispatchEvent(new Event('offline'));
    expect(pwa.online()).toBe(false);
    browser.dispatchEvent(new Event('online'));
    expect(pwa.online()).toBe(true);
    TestBed.resetTestingModule();
    browser.dispatchEvent(new Event('offline'));
    expect(pwa.online()).toBe(true);
  });

  it('consumes the install prompt once and waits for actual installation', async () => {
    const pwa = TestBed.inject(Pwa);
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    browser.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(pwa.canInstall()).toBe(true);
    await Promise.all([pwa.install(), pwa.install()]);
    expect(prompt).toHaveBeenCalledOnce();
    expect(pwa.canInstall()).toBe(false);
    expect(pwa.installed()).toBe(false);
    browser.dispatchEvent(new Event('appinstalled'));
    expect(pwa.installed()).toBe(true);
  });

  it('handles dismissal and install errors without claiming installation', async () => {
    const pwa = TestBed.inject(Pwa);
    browser.dispatchEvent(
      Object.assign(new Event('beforeinstallprompt'), {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      }),
    );
    await pwa.install();
    expect(pwa.installed()).toBe(false);
    browser.dispatchEvent(
      Object.assign(new Event('beforeinstallprompt'), {
        prompt: vi.fn().mockRejectedValue(new Error('unavailable')),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      }),
    );
    await pwa.install();
    expect(pwa.installError()).toBe(true);
    expect(pwa.installing()).toBe(false);
  });

  it('recognizes an installed iOS app without an install prompt', () => {
    browser.navigator.standalone = true;
    const pwa = TestBed.inject(Pwa);
    expect(pwa.installed()).toBe(true);
    expect(pwa.canInstall()).toBe(false);
  });

  it('prompts for ready updates and recovery without automatically reloading', () => {
    const pwa = TestBed.inject(Pwa);
    versions.next({ type: 'VERSION_READY', currentVersion: { hash: 'old' }, latestVersion: { hash: 'new' } });
    expect(pwa.updateReady()).toBe(true);
    unrecoverable.next({ reason: 'missing chunk' });
    expect(pwa.recoveryRequired()).toBe(true);
    expect(browser.location.reload).not.toHaveBeenCalled();
    pwa.reload();
    expect(browser.location.reload).toHaveBeenCalledOnce();
  });

  it('checks for updates when resumed online and handles a failed check', async () => {
    TestBed.inject(Pwa);
    checkForUpdate.mockRejectedValueOnce(new Error('offline'));
    browser.document.dispatchEvent(new Event('visibilitychange'));
    await Promise.resolve();
    expect(checkForUpdate).toHaveBeenCalledOnce();
    browser.dispatchEvent(new Event('offline'));
    browser.document.dispatchEvent(new Event('visibilitychange'));
    expect(checkForUpdate).toHaveBeenCalledOnce();
  });
});
