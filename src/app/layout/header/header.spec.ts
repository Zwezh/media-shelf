import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { NavigationItem } from '@msh-core/navigation';
import { Header } from './header';

@Component({
  template: '',
})
class RouteStub {}

describe('Header', () => {
  const navigationItems: readonly NavigationItem[] = [
    { label: 'Gallery', order: 1, path: '/gallery' },
    { label: 'Statistics', order: 2, path: '/statistics' },
    { label: 'Settings', order: 3, path: '/settings' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
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
});
