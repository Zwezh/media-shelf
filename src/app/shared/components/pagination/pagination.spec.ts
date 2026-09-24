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

  it('shows the visible item range and page size', () => {
    expect(fixture.nativeElement.querySelector('.pagination__summary').textContent).toContain('Showing 31–60 of 124 items');
    expect(fixture.nativeElement.querySelector('.pagination__page-size span').textContent).toContain('Per page:');
    expect(fixture.nativeElement.querySelector('.pagination__page-size strong').textContent).toContain('30');
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
    const labels = [...fixture.nativeElement.querySelectorAll('.pagination__page')].map((button: HTMLButtonElement) =>
      button.textContent?.trim(),
    );
    expect(labels).toEqual(['1', '4', '5', '6', '10']);
  });

  it('marks the selected page and supports first and last navigation', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));
    const selectedPage = fixture.nativeElement.querySelector('[aria-current="page"]') as HTMLButtonElement;
    const boundaries = fixture.nativeElement.querySelectorAll('.pagination__boundary') as NodeListOf<HTMLButtonElement>;

    expect(selectedPage.textContent?.trim()).toBe('2');
    boundaries[0].click();
    boundaries[1].click();

    expect(emitted).toEqual([1, 5]);
  });
});
