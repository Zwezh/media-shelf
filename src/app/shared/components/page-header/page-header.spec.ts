import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PageHeader] }).compileComponents();
    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Movies');
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
