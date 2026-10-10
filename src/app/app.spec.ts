import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { APP_VERSION } from '@msh-core/config/app-version';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { Footer } from '@msh-layout/footer/footer';
import { Header } from '@msh-layout/header/header';
import { MainContent } from '@msh-layout/main-content/main-content';
import { GetGalleryQuery } from '@msh-features/gallery/catalog/application/get-gallery.query';
import { of } from 'rxjs';
import { App } from './app';
import { provideI18nTesting } from './testing/i18n-testing';
import { environment } from '../environments/environment';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideEnvironment(environment),
        provideHttpClient(),
        provideRouter([]),
        provideI18nTesting(),
        { provide: GetGalleryQuery, useValue: { execute: () => of({ currentPage: 0, media: [], totalCount: 0 }) } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell and root router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.directive(Header))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(MainContent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(Footer))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.app-footer__version').textContent).toBe(`v${APP_VERSION}`);
  });
});
