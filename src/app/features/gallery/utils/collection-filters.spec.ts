import {
  countActiveCollectionFilters,
  normalizeCommaSeparatedNames,
  removeCollectionFilter,
  replaceCollectionFilters,
} from './collection-filters';

const baseParams = {
  currentPage: 4,
  direction: 'desc' as const,
  key: 'addedDate' as const,
  pageSize: 30,
  search: 'Dune',
};

describe('movie filters', () => {
  it('replaces filters while retaining non-filter params and resetting the page', () => {
    expect(
      replaceCollectionFilters(
        { ...baseParams, genres: ['Drama'], rating: 7 },
        { ageRating: [12, 16], genres: ['Sci-Fi'], quality: ['4K HDR'] },
      ),
    ).toEqual({
      ...baseParams,
      ageRating: [12, 16],
      currentPage: 0,
      genres: ['Sci-Fi'],
      quality: ['4K HDR'],
    });
  });

  it('removes one filter group and counts the remaining active groups', () => {
    const filters = { actors: 'Actor', fromYear: 2018, genres: ['Drama', 'Sci-Fi'], rating: 7.5, toYear: 2024 };

    expect(countActiveCollectionFilters(filters)).toBe(4);
    expect(removeCollectionFilter({ ...baseParams, ...filters }, 'genres')).toEqual({
      ...baseParams,
      actors: 'Actor',
      currentPage: 0,
      fromYear: 2018,
      rating: 7.5,
      toYear: 2024,
    });
  });

  it('normalizes comma-separated names', () => {
    expect(normalizeCommaSeparatedNames(' Actor One, Actor Two,Actor One ')).toBe('Actor One,Actor Two');
    expect(normalizeCommaSeparatedNames(' , ')).toBeUndefined();
  });
});
