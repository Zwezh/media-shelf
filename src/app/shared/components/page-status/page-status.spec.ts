import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStatus } from './page-status';
import { provideI18nTesting } from '@msh/testing/i18n-testing';

describe('PageStatus', () => {
  let fixture: ComponentFixture<PageStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStatus],
      providers: [provideI18nTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PageStatus);
    fixture.componentRef.setInput('messageKey', 'movies.loading');
  });

  it('announces loading progress politely', () => {
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.page-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.querySelector('.page-status__spinner')).not.toBeNull();
    expect(status.querySelector('.page-status__description')).toBeNull();
  });

  it('shows the translated cold-start description only while loading backend data', async () => {
    fixture.componentRef.setInput('descriptionKey', 'common.coldStart');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-status__description')?.textContent).toContain('30–60 seconds');
    expect(element.querySelector('.page-status__description')?.textContent).toContain('Render');

    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('messageKey', 'movies.loadError');
    await fixture.whenStable();
    expect(element.querySelector('.page-status__description')).toBeNull();
  });

  it('announces errors assertively without a loading spinner', () => {
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('messageKey', 'movies.loadError');
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.page-status');
    expect(status.getAttribute('role')).toBe('alert');
    expect(status.getAttribute('aria-live')).toBe('assertive');
    expect(status.querySelector('.page-status__spinner')).toBeNull();
  });
});
