import { TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders the product status and supplied version', async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    const fixture = TestBed.createComponent(Footer);
    fixture.componentRef.setInput('version', '1.2.3');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('MediaShelf — Archival Media Management Suite');
    expect(fixture.nativeElement.textContent).toContain('Library Synced');
    expect(fixture.nativeElement.querySelector('.app-footer__version').textContent).toBe('v1.2.3');
  });
});
