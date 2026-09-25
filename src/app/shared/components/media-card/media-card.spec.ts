import { TestBed } from '@angular/core/testing';
import { type Media } from '@msh-features/gallery/models/media';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MediaCard } from './media-card';

const media: Media = {
  ageRating: '16+',
  director: 'Denis Villeneuve',
  durationMinutes: 166,
  genres: ['Science fiction', 'Drama'],
  id: 'dune-part-two',
  originalTitle: 'Dune: Part Two',
  posterUrl: '/poster.jpg',
  quality: '4K HDR',
  rating: 8.5,
  title: 'Dune: Part Two',
  type: 'movie',
  year: '2024',
};

describe('MediaCard', () => {
  it('renders Stitch card metadata and emits typed view, edit, and delete actions', async () => {
    TestBed.configureTestingModule({ providers: provideI18nTesting() });
    const fixture = TestBed.createComponent(MediaCard);
    fixture.componentRef.setInput('media', media);
    const viewed = vi.fn();
    const edited = vi.fn();
    const deleted = vi.fn();
    fixture.componentInstance.viewRequested.subscribe(viewed);
    fixture.componentInstance.editRequested.subscribe(edited);
    fixture.componentInstance.deleteRequested.subscribe(deleted);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const actions = element.querySelectorAll<HTMLButtonElement>('.media-card__action');
    expect(actions).toHaveLength(3);
    expect(element.querySelector('.media-card__heading')?.textContent).toContain('Dune: Part Two');
    expect(element.querySelector('.media-card__details')?.textContent).toContain('Science fiction, Drama');
    expect(element.querySelector('.media-card__overlay-meta')?.textContent).toContain('2h 46m');

    actions[0].click();
    actions[1].click();
    actions[2].click();

    expect(viewed).toHaveBeenCalledWith(media);
    expect(edited).toHaveBeenCalledWith(media);
    expect(deleted).toHaveBeenCalledWith(media);
  });
});
