import { TestBed } from '@angular/core/testing';
import { AuthSession } from '@msh-core/auth/auth-session';
import { provideAuthSessionTesting, resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { MediaCard } from './media-card';
import type { MediaCardModel } from './media-card.model';

const media: MediaCardModel = {
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
  beforeEach(resetTestAuthStorage);

  it('renders Stitch card metadata and emits typed view, edit, and delete actions', async () => {
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), ...provideI18nTesting()] });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
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
    expect(element.querySelector('msh-media-badge[tone="movie"]')).toBeNull();
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

  it('keeps edit and delete disabled while signed out', async () => {
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), ...provideI18nTesting()] });
    const fixture = TestBed.createComponent(MediaCard);
    fixture.componentRef.setInput('media', media);
    await fixture.whenStable();

    const actions = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.media-card__action');
    expect(actions[0]?.disabled).toBe(false);
    expect(actions[1]?.disabled).toBe(true);
    expect(actions[2]?.disabled).toBe(true);
  });
});

describe('MediaCard nullable collection metadata', () => {
  it('keeps zero ratings and hides unknown fields and unrequested mutation actions', async () => {
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), ...provideI18nTesting()] });
    const fixture = TestBed.createComponent(MediaCard);
    fixture.componentRef.setInput('media', { ...media, type: 'series', rating: 0, ageRating: null, quality: null, durationMinutes: null });
    fixture.componentRef.setInput('actions', ['view']);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.media-card__action')).toHaveLength(1);
    expect(element.querySelector('msh-media-rating')?.textContent).toContain('0.0');
    expect(element.querySelectorAll('msh-media-badge')).toHaveLength(0);
    fixture.componentRef.setInput('media', { ...media, rating: null });
    await fixture.whenStable();
    expect(element.querySelector('msh-media-rating')).toBeNull();
  });
});

describe('Wishlist card presentation', () => {
  it.each(['movie', 'series'] as const)('shows a %s type badge and hides quality even when supplied', async (type) => {
    TestBed.configureTestingModule({ providers: [provideAuthSessionTesting(), ...provideI18nTesting()] });
    const fixture = TestBed.createComponent(MediaCard);
    fixture.componentRef.setInput('media', { ...media, type });
    fixture.componentRef.setInput('showTypeBadge', true);
    fixture.componentRef.setInput('showQuality', false);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(`.badge--${type}`)?.textContent).toBe(type === 'movie' ? 'Movie' : 'Series');
    expect(element.querySelector('.badge--quality')).toBeNull();
    expect(element.textContent).not.toContain('4K HDR');
    expect(element.textContent).not.toContain('Seasons:');
  });
});
