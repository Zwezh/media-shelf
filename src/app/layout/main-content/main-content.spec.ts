import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { MainContent } from './main-content';

describe('MainContent', () => {
  it('renders the primary router outlet inside main', async () => {
    await TestBed.configureTestingModule({
      imports: [MainContent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(MainContent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('main')).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
  });
});
