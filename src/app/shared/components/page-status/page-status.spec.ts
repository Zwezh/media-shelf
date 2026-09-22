import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageStatus } from './page-status';

describe('PageStatus', () => {
  let fixture: ComponentFixture<PageStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PageStatus] }).compileComponents();
    fixture = TestBed.createComponent(PageStatus);
    fixture.componentRef.setInput('message', 'Loading movies…');
  });

  it('announces loading progress politely', () => {
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.page-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.querySelector('.page-status__spinner')).not.toBeNull();
  });

  it('announces errors assertively without a loading spinner', () => {
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('message', 'Movies could not be loaded.');
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.page-status');
    expect(status.getAttribute('role')).toBe('alert');
    expect(status.getAttribute('aria-live')).toBe('assertive');
    expect(status.querySelector('.page-status__spinner')).toBeNull();
  });
});
