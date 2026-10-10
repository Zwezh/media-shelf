import { convertToParamMap } from '@angular/router';
import { parseGalleryPage } from './gallery-parser';
import { readGalleryParams } from '../state/gallery-route-state';
import { galleryCard, galleryItemRoute, wishlistSummary } from '../utils/gallery-display';
import { toTitle } from '../utils/title.converter';
import { movieTitleDto, seriesDto } from '../testing/title.fixture';
const item = { ...movieTitleDto, collection: 'movies', series: null, qualityValues: ['1080p'] };
describe('Gallery compact read boundary', () => {
  it('parses summary fields without requiring the full metadata graph', () => {
    const { description, actors, formats, countries, ...compact } = item;
    void description;
    void actors;
    void formats;
    void countries;
    const page = parseGalleryPage({ list: [compact], totalCount: 1, currentPage: 0 });
    expect(page.media[0].title).toBe(item.name);
    expect(galleryItemRoute(page.media[0])).toEqual(['/gallery', 'movies', item.id]);
    expect(galleryCard(page.media[0], { present: 'Present', unknown: 'Unknown' }).quality).toBe('1080p');
  });
  it('rejects malformed kinds, memberships, nullable numeric fields and missing series summary', () => {
    for (const value of [
      { ...item, collection: 'series' },
      { ...item, rating: undefined },
      { ...item, kind: 'series', collection: 'wishlist', series: null },
      { ...item, kpId: '0' },
    ])
      expect(() => parseGalleryPage({ list: [value], totalCount: 1, currentPage: 0 })).toThrow();
  });
  it('converts full refresh results into an explicit compact projection', () => {
    const summary = wishlistSummary(toTitle(seriesDto));
    expect(summary.collection).toBe('wishlist');
    expect(summary.series?.recordedSeasonCount).toBe(seriesDto.series.seasons.length);
    expect(galleryItemRoute(summary)).toEqual(['/gallery', 'wishlist', summary.id]);
  });
  it('canonicalizes scope URLs and keeps legacy filter parsing', () => {
    const params = readGalleryParams(
      convertToParamMap({ collections: ['wishlist,movies', 'movies'], kinds: 'series', search: '  Dune  ', currentPage: '2' }),
    );
    expect(params.collections).toEqual(['movies', 'wishlist']);
    expect(params.kinds).toEqual(['series']);
    expect(params.currentPage).toBe(2);
    expect(readGalleryParams(convertToParamMap({ collections: 'wishlist,series,movies' })).collections).toBeUndefined();
  });
});
