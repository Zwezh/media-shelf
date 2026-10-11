import {
  EMPTY_FORM,
  toFormModel,
  toCollectionFilters,
  toggleValue,
  areCollectionFiltersEqual,
  type MoviesFilterFormModel,
} from './movies-filter-form';
import { PRODUCTION_STATUSES } from '../../../models/production-status';
import { RELEASE_YEAR_RANGE } from '../../../models/media-limits';
import { ChangeDetectionStrategy, computed, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { Icon } from '@msh-shared/components/icon/icon';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { MEDIA_AGE_RATINGS } from '../../../models/media-options';
import { type CollectionFilters } from '../../../models/collection-filters';

export type MoviesFilterPanelData = {
  readonly filters: CollectionFilters;
  readonly seriesFilters?: boolean;
};

type SelectedFilter = {
  readonly id: string;
  readonly label: string;
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

  protected readonly seriesFilters = this.data.seriesFilters === true;
  protected readonly productionStatuses = PRODUCTION_STATUSES.map((value) => ({ value, label: translate(`series.status.${value}`) }));
  private readonly incompleteLabel = translate('series.filters.incomplete');
  protected readonly settings = inject(SettingsStore);
  protected readonly ageRatings = MEDIA_AGE_RATINGS;
  protected readonly qualityOptions = this.settings.qualityOptions;
  private readonly initialModel = toFormModel(this.data.filters);
  protected readonly filterForm = inject(FormBuilder).nonNullable.group({
    productionStatus: this.initialModel.productionStatus,
    seasonAvailability: this.initialModel.seasonAvailability,
    actors: this.initialModel.actors,
    ageRating: [this.initialModel.ageRating],
    directors: this.initialModel.directors,
    fromYear: [
      this.initialModel.fromYear,
      [Validators.pattern(/^$|^\d{4}$/), Validators.min(RELEASE_YEAR_RANGE.min), Validators.max(RELEASE_YEAR_RANGE.max)],
    ],
    genres: [this.initialModel.genres],
    quality: [this.initialModel.quality],
    rating: [this.initialModel.rating, [Validators.min(0), Validators.max(10)]],
    toYear: [
      this.initialModel.toYear,
      [Validators.pattern(/^$|^\d{4}$/), Validators.min(RELEASE_YEAR_RANGE.min), Validators.max(RELEASE_YEAR_RANGE.max)],
    ],
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
      ...(value.productionStatus
        ? [{ id: 'productionStatus', label: this.productionStatuses.find((status) => status.value === value.productionStatus)!.label() }]
        : []),
      ...(value.seasonAvailability ? [{ id: 'seasonAvailability', label: this.incompleteLabel() }] : []),
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
        case 'productionStatus':
          return { ...value, productionStatus: '' };
        case 'seasonAvailability':
          return { ...value, seasonAvailability: false };
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
