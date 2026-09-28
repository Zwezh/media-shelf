import { Component, computed, ElementRef, inject, linkedSignal } from '@angular/core';
import { form, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsApi } from '@msh-core/settings/settings-api';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { ArtworkAssets } from '../components/artwork-assets/artwork-assets';
import { BasicInformation } from '../components/basic-information/basic-information';
import { ClassificationMetrics } from '../components/classification-metrics/classification-metrics';
import { LocalFile } from '../components/local-file/local-file';
import { ProductionCast } from '../components/production-cast/production-cast';
import { RelationshipsUniverse } from '../components/relationships-universe/relationships-universe';
import { MovieEditorStore } from '../state/movie-editor.store';
import { toMediaDto } from '../utils/movie-editor.converter';

@Component({
  imports: [
    ArtworkAssets,
    BasicInformation,
    ClassificationMetrics,
    LocalFile,
    PageStatus,
    ProductionCast,
    RelationshipsUniverse,
    RouterLink,
    TranslatePipe,
  ],
  providers: [MovieEditorStore],
  selector: 'msh-movie-editor',
  styleUrls: ['./movie-editor.scss', './movie-editor-responsive.scss'],
  templateUrl: './movie-editor.html',
})
export class MovieEditorPage {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly settingsApi = inject(SettingsApi);
  protected readonly store = inject(MovieEditorStore);
  protected readonly model = linkedSignal(() => this.store.seed());
  protected readonly movieForm = form(this.model, (schema) => {
    validate(schema.name, ({ value }) => (value().trim() ? undefined : { kind: 'required', message: 'movieEditor.validation.required' }));
    validate(schema.year, ({ value }) => yearRange(value(), 'movieEditor.validation.year'));
    validate(schema.rating, ({ value }) => numericRange(value(), 0, 10, true, 'movieEditor.validation.rating'));
    validate(schema.movieLength, ({ value }) => numericRange(value(), 0, 100_000, true, 'movieEditor.validation.duration', true));
    validate(schema.kpId, ({ value }) => numericRange(value(), 1, 15_000_000, true, 'movieEditor.validation.kpId', true));
  });
  protected readonly titleKey = computed(() => (this.store.mode() === 'add' ? 'movieEditor.addTitle' : 'movieEditor.editTitle'));
  protected readonly breadcrumbTitle = computed(
    () => this.store.breadcrumbTitle() || (this.store.mode() === 'add' ? 'movieEditor.breadcrumbs.add' : 'movieEditor.breadcrumbs.edit'),
  );
  protected readonly canAutofill = computed(() => {
    const id = Number(this.model().kpId);
    return Number.isInteger(id) && id > 0 && id <= 15_000_000 && !this.store.isBusy();
  });

  protected autofill(): void {
    if (!this.canAutofill()) return;
    this.store.autofill({ currentModel: this.model, id: Number(this.model().kpId) });
  }

  protected discard(): void {
    this.store.discard();
  }

  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.store.isBusy()) return;
    await submit(this.movieForm, async () => {
      this.store.save(toMediaDto(this.model()));
    });
    if (this.movieForm().invalid()) this.focusFirstInvalidField();
  }

  protected toggleGenre(genre: string): void {
    this.model.update((model) => ({
      ...model,
      genres: model.genres.includes(genre) ? model.genres.filter((item) => item !== genre) : [...model.genres, genre],
    }));
  }

  private focusFirstInvalidField(): void {
    const invalidFieldIds = [
      [this.movieForm.name().invalid(), 'movie-editor-name'],
      [this.movieForm.year().invalid(), 'movie-editor-year'],
      [this.movieForm.rating().invalid(), 'movie-editor-rating'],
      [this.movieForm.movieLength().invalid(), 'movie-editor-duration'],
      [this.movieForm.kpId().invalid(), 'movie-editor-kp-id'],
    ] as const;
    const firstInvalidId = invalidFieldIds.find(([invalid]) => invalid)?.[1];
    if (firstInvalidId) this.elementRef.nativeElement.querySelector<HTMLElement>(`#${firstInvalidId}`)?.focus();
  }
}

function numericRange(value: string, minimum: number, maximum: number, optional: boolean, message: string, integer = false) {
  if (optional && value.trim() === '') return undefined;
  const numericValue = Number(value);
  const hasValidPrecision = !integer || Number.isInteger(numericValue);
  return Number.isFinite(numericValue) && hasValidPrecision && numericValue >= minimum && numericValue <= maximum
    ? undefined
    : { kind: 'range', message };
}

function yearRange(value: string, message: string) {
  if (value.trim() === '') return undefined;
  const years = value.split(',').map((year) => Number(year.trim()));
  return years.length <= 2 && years.every((year) => Number.isInteger(year) && year >= 1888 && year <= 2100)
    ? undefined
    : { kind: 'range', message };
}
