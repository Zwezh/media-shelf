import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { DetailCard } from './detail-card';

@Component({
  imports: [DetailCard],
  template: `
    <msh-detail-card headingId="details-heading" titleKey="movieDetails.additionalInformation.title">
      <span detail-card-header>Header action</span>
      <p>Projected body</p>
    </msh-detail-card>
  `,
})
class DetailCardHost {}

describe('DetailCard', () => {
  it('labels the card and projects header and body content', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(DetailCardHost);

    await fixture.whenStable();

    const section = fixture.nativeElement.querySelector('section');
    expect(section.getAttribute('aria-labelledby')).toBe('details-heading');
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Additional information');
    expect(section.textContent).toContain('Header action');
    expect(section.textContent).toContain('Projected body');
  });
});
