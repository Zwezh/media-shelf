import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AuthSession } from '@msh-core/auth/auth-session';
import { NavigationItem } from '@msh-core/navigation';
import { IconRegistry } from '@msh-shared/components/icon/icon-registry';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { Header } from './header';

@Component({
  template: '',
})
class RouteStub {}

describe('Header', () => {
  const navigationItems: readonly NavigationItem[] = [
    { labelKey: 'navigation.gallery', order: 1, path: '/gallery' },
    { labelKey: 'navigation.statistics', order: 2, path: '/statistics' },
    { labelKey: 'navigation.settings', order: 3, path: '/settings' },
  ];

  beforeEach(async () => {
    resetTestAuthStorage();
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideI18nTesting(),
        {
          provide: IconRegistry,
          useValue: { getIcon: vi.fn(async () => document.createElementNS('http://www.w3.org/2000/svg', 'svg')) },
        },
        provideRouter([
          {
            path: 'gallery',
            component: RouteStub,
            children: [{ path: 'wishlist', component: RouteStub }],
          },
          { path: 'statistics', component: RouteStub },
          { path: 'settings', component: RouteStub },
        ]),
      ],
    }).compileComponents();
  });

  it('renders the brand link and route-driven navigation', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('navigationItems', navigationItems);
    fixture.detectChanges();

    const brand = fixture.nativeElement.querySelector('.app-header__brand') as HTMLAnchorElement;
    const logo = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    const links = Array.from(fixture.nativeElement.querySelectorAll('.app-header__navigation-link') as NodeListOf<HTMLAnchorElement>);

    expect(brand.getAttribute('href')).toBe('/gallery');
    expect(brand.getAttribute('aria-label')).toBe('MediaShelf home');
    expect(logo.getAttribute('ng-reflect-ng-src') ?? logo.getAttribute('src')).toContain('logo.svg');
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Gallery', 'Statistics', 'Settings']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/gallery', '/statistics', '/settings']);
  });

  it('keeps Gallery active for its child routes', async () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('navigationItems', navigationItems);
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/gallery/wishlist');
    fixture.detectChanges();

    const activeLink = fixture.debugElement.query(By.css('.app-header__navigation-link--active')).nativeElement as HTMLAnchorElement;

    expect(activeLink.textContent?.trim()).toBe('Gallery');
    expect(activeLink.getAttribute('aria-current')).toBe('page');
  });

  it('opens sign in and swaps to sign out for an authenticated session', () => {
    const open = vi.spyOn(TestBed.inject(FloatingPanel), 'open').mockImplementation(() => new FloatingPanelRef<unknown>(() => undefined));
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('navigationItems', navigationItems);
    fixture.detectChanges();

    const authButton = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.app-header__auth button')!;
    expect(authButton().textContent).toContain('Sign In');
    authButton().click();
    expect(open).toHaveBeenCalledOnce();

    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
    fixture.detectChanges();
    expect(authButton().textContent).toContain('Sign Out');

    authButton().click();
    fixture.detectChanges();
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
    expect(authButton().textContent).toContain('Sign In');
  });

  it('composes dedicated language and theme selectors', async () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('navigationItems', navigationItems);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('msh-language-selector')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('msh-theme-selector')).not.toBeNull();
  });
});
