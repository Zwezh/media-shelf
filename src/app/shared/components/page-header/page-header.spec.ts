import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';
import { provideI18nTesting } from '@msh/testing/i18n-testing';

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [provideI18nTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('titleKey', 'movies.title');
    fixture.componentRef.setInput('itemCount', 30);
    fixture.componentRef.setInput('headingId', 'movies-title');
    fixture.detectChanges();
  });

  it('renders the page identity and item count', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading.id).toBe('movies-title');
    expect(heading.textContent).toContain('Movies');
    expect(fixture.nativeElement.querySelector('p').textContent).toContain('30 items');
  });
});
