import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { APP_VERSION } from '@msh-core/config/app-version';
import { Footer } from '@msh-layout/footer/footer';
import { Header } from '@msh-layout/header/header';
import { MainContent } from '@msh-layout/main-content/main-content';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
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
