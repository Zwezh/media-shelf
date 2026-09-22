import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';
import { provideI18nTesting } from '@msh/testing/i18n-testing';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
      providers: [provideI18nTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 30);
    fixture.componentRef.setInput('totalItems', 124);
    fixture.detectChanges();
  });

  it('shows the archival page summary', () => {
    expect(fixture.nativeElement.querySelector('p').textContent).toContain('Page 2 of 5 (124 items)');
  });

  it('emits the selected page', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));
    const pageThree = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.trim() === '3',
    );
    pageThree?.click();
    expect(emitted).toEqual([3]);
  });

  it('keeps adjacent pages visible around the current middle page', () => {
    fixture.componentRef.setInput('page', 5);
    fixture.componentRef.setInput('totalItems', 300);
    fixture.detectChanges();
    const labels = [...fixture.nativeElement.querySelectorAll('button')].map((button: HTMLButtonElement) => button.textContent?.trim());
    expect(labels).toEqual(['‹', '1', '4', '5', '6', '10', '›']);
  });
});
