import { ChangeDetectionStrategy, computed, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { Icon } from '@msh-shared/components/icon/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MEDIA_AGE_RATINGS } from '../../../models/media-options';
import { type CollectionFilters } from '../../../models/collection-filters';
import { normalizeCommaSeparatedNames } from '../../../utils/collection-filters';

export type MoviesFilterPanelData = {
  readonly filters: CollectionFilters;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, TranslatePipe],
  selector: 'msh-movies-filter-panel',
  styleUrls: ['./movies-filter-panel.scss', './movies-filter-controls.scss', './movies-filter-actions.scss'],
  templateUrl: './movies-filter-panel.html',
})
export class MoviesFilterPanel {
  private readonly data = inject(FLOATING_PANEL_DATA) as MoviesFilterPanelData;
  private readonly panelRef = inject<FloatingPanelRef<CollectionFilters>>(FloatingPanelRef);
  private readonly initialFilters = toCollectionFilters(toFormModel(this.data.filters));

  protected readonly settings = inject(SettingsStore);
  protected readonly ageRatings = MEDIA_AGE_RATINGS;
  protected readonly qualityOptions = this.settings.qualityOptions;
  private readonly initialModel = toFormModel(this.data.filters);
  protected readonly filterForm = inject(FormBuilder).nonNullable.group({
    actors: this.initialModel.actors,
    ageRating: [this.initialModel.ageRating],
    directors: this.initialModel.directors,
    fromYear: [this.initialModel.fromYear, [Validators.pattern(/^$|^\d{4}$/), Validators.min(1888), Validators.max(2100)]],
    genres: [this.initialModel.genres],
    quality: [this.initialModel.quality],
    rating: [this.initialModel.rating, [Validators.min(0), Validators.max(10)]],
    toYear: [this.initialModel.toYear, [Validators.pattern(/^$|^\d{4}$/), Validators.min(1888), Validators.max(2100)]],
  });
  protected readonly model = toSignal(this.filterForm.valueChanges.pipe(map(() => this.filterForm.getRawValue())), {
    initialValue: this.initialModel,
  });
  protected readonly yearRangeInvalid = computed(() => {
    const fromYear = Number(this.model().fromYear);
    const toYear = Number(this.model().toYear);
    return fromYear > 0 && toYear > 0 && fromYear > toYear;
  });
  protected readonly canApply = computed(() => {
    const filters = toCollectionFilters(this.model());
    return this.filterForm.valid && !this.yearRangeInvalid() && !areCollectionFiltersEqual(filters, this.initialFilters);
  });
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
    this.panelRef.close(toCollectionFilters(this.model()));
  }

  protected reset(): void {
    this.filterForm.setValue({ ...EMPTY_FORM, ageRating: [], genres: [], quality: [] });
  }

  protected updateRating(event: Event): void {
    const rating = Number((event.target as HTMLInputElement).value);
    this.updateModel((value) => ({ ...value, rating }));
  }

  protected removeSelectedFilter(id: string): void {
    this.updateModel((value) => {
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

  private updateModel(update: (value: MoviesFilterFormModel) => MoviesFilterFormModel): void {
    this.filterForm.setValue(update(this.filterForm.getRawValue()));
  }

  protected toggleGenre(genre: string): void {
    this.updateModel((value) => ({ ...value, genres: toggleValue(value.genres, genre) }));
  }

  protected toggleQuality(quality: string): void {
    this.updateModel((value) => ({ ...value, quality: toggleValue(value.quality, quality) }));
  }

  protected toggleAgeRating(ageRating: number): void {
    this.updateModel((value) => ({ ...value, ageRating: toggleValue(value.ageRating, ageRating) }));
  }
}

function toFormModel(filters: CollectionFilters): MoviesFilterFormModel {
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

function toCollectionFilters(value: MoviesFilterFormModel): CollectionFilters {
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

function areCollectionFiltersEqual(left: CollectionFilters, right: CollectionFilters): boolean {
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
