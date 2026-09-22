import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
    fixture = TestBed.createComponent(EmptyState);
  });

  it('renders the supplied empty collection message', () => {
    fixture.componentRef.setInput('message', 'There are no movies available.');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').textContent).toContain('There are no movies available.');
  });
});
