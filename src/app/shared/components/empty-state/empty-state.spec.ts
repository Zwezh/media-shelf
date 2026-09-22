import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';
import { provideI18nTesting } from '@msh/testing/i18n-testing';

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
      providers: [provideI18nTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyState);
  });

  it('renders the supplied empty collection message', () => {
    fixture.componentRef.setInput('messageKey', 'movies.empty');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').textContent).toContain('There are no movies available.');
  });
});
