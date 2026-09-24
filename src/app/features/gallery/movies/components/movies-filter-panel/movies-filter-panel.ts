import { computed, Component, inject, signal } from '@angular/core';
import { FormField, form, max, min, pattern, submit } from '@angular/forms/signals';
import { SettingsApi } from '@msh-core/settings/settings-api';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { Icon } from '@msh-shared/components/icon/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { type MoviesFilters } from '../../../models/movies-filters';
import { normalizeCommaSeparatedNames } from '../../../utils/movies-filters';

export type MoviesFilterPanelData = {
  readonly filters: MoviesFilters;
};

type MoviesFilterFormModel = {
  actors: string;
  ageRating: number[];
  directors: string;
  fromYear: string;
  genres: string[];
  quality: string[];
  rating: number;
  toYear: string;
};

type SelectedFilter = {
  readonly id: string;
  readonly label: string;
};

const AGE_RATINGS = [0, 6, 12, 16, 18] as const;
const QUALITY_OPTIONS = ['4K UHD', '4K HDR', '1080p FHD', 'Remux / Lossless'] as const;
const EMPTY_FORM: MoviesFilterFormModel = {
  actors: '',
  ageRating: [],
  directors: '',
  fromYear: '',
  genres: [],
  quality: [],
  rating: 0,
  toYear: '',
};

@Component({
  imports: [FormField, Icon, TranslatePipe],
  selector: 'msh-movies-filter-panel',
  styleUrls: ['./movies-filter-panel.scss', './movies-filter-controls.scss', './movies-filter-actions.scss'],
  templateUrl: './movies-filter-panel.html',
})
export class MoviesFilterPanel {
  private readonly data = inject(FLOATING_PANEL_DATA) as MoviesFilterPanelData;
  private readonly panelRef = inject<FloatingPanelRef<MoviesFilters>>(FloatingPanelRef);
  private readonly initialFilters = toMoviesFilters(toFormModel(this.data.filters));

  protected readonly settingsApi = inject(SettingsApi);
  protected readonly ageRatings = AGE_RATINGS;
  protected readonly qualityOptions = QUALITY_OPTIONS;
  protected readonly model = signal<MoviesFilterFormModel>(toFormModel(this.data.filters));
  protected readonly filterForm = form(this.model, (schema) => {
    pattern(schema.fromYear, /^$|^\d{4}$/, { message: 'movies.filters.invalidYear' });
    pattern(schema.toYear, /^$|^\d{4}$/, { message: 'movies.filters.invalidYear' });
    min(schema.rating, 0);
    max(schema.rating, 10);
  });
  protected readonly yearRangeInvalid = computed(() => {
    const fromYear = Number(this.model().fromYear);
    const toYear = Number(this.model().toYear);
    return fromYear > 0 && toYear > 0 && fromYear > toYear;
  });
  protected readonly canApply = computed(
    () =>
      this.filterForm().valid() && !this.yearRangeInvalid() && !areMoviesFiltersEqual(toMoviesFilters(this.model()), this.initialFilters),
  );
  protected readonly selectedFilters = computed<readonly SelectedFilter[]>(() => {
    const value = this.model();
    return [
      ...(value.genres.length ? [{ id: 'genres', label: value.genres.join(', ') }] : []),
      ...(value.fromYear || value.toYear ? [{ id: 'years', label: `${value.fromYear || '…'}–${value.toYear || '…'}` }] : []),
      ...(value.rating > 0 ? [{ id: 'rating', label: `${value.rating}+` }] : []),
      ...(value.quality.length ? [{ id: 'quality', label: value.quality.join(', ') }] : []),
      ...(value.ageRating.length ? [{ id: 'ageRating', label: value.ageRating.map((rating) => `${rating}+`).join(', ') }] : []),
      ...(value.actors ? [{ id: 'actors', label: value.actors }] : []),
      ...(value.directors ? [{ id: 'directors', label: value.directors }] : []),
    ];
  });

  protected close(): void {
    this.panelRef.close();
  }

  protected apply(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.canApply()) return;
    submit(this.filterForm, async () => this.panelRef.close(toMoviesFilters(this.model())));
  }

  protected reset(): void {
    this.model.set({ ...EMPTY_FORM, ageRating: [], genres: [], quality: [] });
  }

  protected removeSelectedFilter(id: string): void {
    this.model.update((value) => {
      switch (id) {
        case 'genres':
          return { ...value, genres: [] };
        case 'years':
          return { ...value, fromYear: '', toYear: '' };
        case 'rating':
          return { ...value, rating: 0 };
        case 'quality':
          return { ...value, quality: [] };
        case 'ageRating':
          return { ...value, ageRating: [] };
        case 'actors':
          return { ...value, actors: '' };
        case 'directors':
          return { ...value, directors: '' };
        default:
          return value;
      }
    });
  }

  protected toggleGenre(genre: string): void {
    this.model.update((value) => ({ ...value, genres: toggleValue(value.genres, genre) }));
  }

  protected toggleQuality(quality: string): void {
    this.model.update((value) => ({ ...value, quality: toggleValue(value.quality, quality) }));
  }

  protected toggleAgeRating(ageRating: number): void {
    this.model.update((value) => ({ ...value, ageRating: toggleValue(value.ageRating, ageRating) }));
  }
}

function toFormModel(filters: MoviesFilters): MoviesFilterFormModel {
  return {
    actors: filters.actors ?? '',
    ageRating: [...(filters.ageRating ?? [])],
    directors: filters.directors ?? '',
    fromYear: filters.fromYear?.toString() ?? '',
    genres: [...(filters.genres ?? [])],
    quality: [...(filters.quality ?? [])],
    rating: filters.rating ?? 0,
    toYear: filters.toYear?.toString() ?? '',
  };
}

function toMoviesFilters(value: MoviesFilterFormModel): MoviesFilters {
  const actors = normalizeCommaSeparatedNames(value.actors);
  const directors = normalizeCommaSeparatedNames(value.directors);
  const fromYear = value.fromYear ? Number(value.fromYear) : undefined;
  const toYear = value.toYear ? Number(value.toYear) : undefined;

  return {
    ...(actors ? { actors } : {}),
    ...(value.ageRating.length ? { ageRating: [...value.ageRating].sort((left, right) => left - right) } : {}),
    ...(directors ? { directors } : {}),
    ...(fromYear ? { fromYear } : {}),
    ...(value.genres.length ? { genres: [...value.genres] } : {}),
    ...(value.quality.length ? { quality: [...value.quality] } : {}),
    ...(value.rating > 0 ? { rating: value.rating } : {}),
    ...(toYear ? { toYear } : {}),
  };
}

function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
}

function areMoviesFiltersEqual(left: MoviesFilters, right: MoviesFilters): boolean {
  return (
    left.actors === right.actors &&
    left.directors === right.directors &&
    left.fromYear === right.fromYear &&
    left.rating === right.rating &&
    left.toYear === right.toYear &&
    haveSameValues(left.ageRating, right.ageRating) &&
    haveSameValues(left.genres, right.genres) &&
    haveSameValues(left.quality, right.quality)
  );
}

function haveSameValues<T>(left: readonly T[] | undefined, right: readonly T[] | undefined): boolean {
  const leftValues = left ?? [];
  const rightValues = right ?? [];
  return leftValues.length === rightValues.length && leftValues.every((value) => rightValues.includes(value));
}
