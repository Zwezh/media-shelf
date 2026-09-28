import { Component, computed, ElementRef, inject, linkedSignal } from '@angular/core';
import { form, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsApi } from '@msh-core/settings/settings-api';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
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
    RequiresAuth,
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
    required(schema.name, { message: 'movieEditor.validation.required' });
    validate(schema.name, ({ value }) => requiredText(value()));
    required(schema.enName, { message: 'movieEditor.validation.required' });
    validate(schema.enName, ({ value }) => requiredText(value()));
    required(schema.year, { message: 'movieEditor.validation.required' });
    validate(schema.year, ({ value }) => yearRange(value(), 'movieEditor.validation.year'));
    required(schema.genres, { message: 'movieEditor.validation.required' });
    required(schema.description, { message: 'movieEditor.validation.required' });
    validate(schema.description, ({ value }) => requiredText(value()));
    required(schema.rating, { message: 'movieEditor.validation.required' });
    validate(schema.rating, ({ value }) => numericRange(value(), 0, 10, false, 'movieEditor.validation.rating'));
    required(schema.movieLength, { message: 'movieEditor.validation.required' });
    validate(schema.movieLength, ({ value }) => numericRange(value(), 0, 100_000, false, 'movieEditor.validation.duration', true));
    required(schema.kpId, { message: 'movieEditor.validation.required' });
    validate(schema.kpId, ({ value }) => numericRange(value(), 1, 15_000_000, false, 'movieEditor.validation.kpId', true));
    required(schema.posterUrl, { message: 'movieEditor.validation.required' });
    validate(schema.posterUrl, ({ value }) => requiredText(value()));
    required(schema.backdropUrl, { message: 'movieEditor.validation.required' });
    validate(schema.backdropUrl, ({ value }) => requiredText(value()));
    required(schema.directors, { message: 'movieEditor.validation.required' });
    validate(schema.directors, ({ value }) => requiredText(value()));
    required(schema.countries, { message: 'movieEditor.validation.required' });
    validate(schema.countries, ({ value }) => requiredText(value()));
    required(schema.actors, { message: 'movieEditor.validation.required' });
    validate(schema.actors, ({ value }) => requiredText(value()));
    required(schema.quality, { message: 'movieEditor.validation.required' });
    validate(schema.quality, ({ value }) => requiredText(value()));
    required(schema.extension, { message: 'movieEditor.validation.required' });
    validate(schema.extension, ({ value }) => requiredText(value()));
    required(schema.addedDate, { message: 'movieEditor.validation.required' });
    validate(schema.addedDate, ({ value }) => requiredText(value()));
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
      [this.movieForm.enName().invalid(), 'movie-editor-en-name'],
      [this.movieForm.year().invalid(), 'movie-editor-year'],
      [this.movieForm.genres().invalid(), 'movie-editor-genres'],
      [this.movieForm.description().invalid(), 'movie-editor-description'],
      [this.movieForm.rating().invalid(), 'movie-editor-rating'],
      [this.movieForm.movieLength().invalid(), 'movie-editor-duration'],
      [this.movieForm.kpId().invalid(), 'movie-editor-kp-id'],
      [this.movieForm.posterUrl().invalid(), 'movie-editor-poster-url'],
      [this.movieForm.backdropUrl().invalid(), 'movie-editor-backdrop-url'],
      [this.movieForm.directors().invalid(), 'movie-editor-directors'],
      [this.movieForm.countries().invalid(), 'movie-editor-countries'],
      [this.movieForm.actors().invalid(), 'movie-editor-actors'],
      [this.movieForm.quality().invalid(), 'movie-editor-quality'],
      [this.movieForm.extension().invalid(), 'movie-editor-extension'],
      [this.movieForm.addedDate().invalid(), 'movie-editor-added-date'],
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
  if (value.trim() === '') return { kind: 'range', message };
  const years = value.split(',').map((year) => Number(year.trim()));
  return years.length <= 2 && years.every((year) => Number.isInteger(year) && year >= 1888 && year <= 2100)
    ? undefined
    : { kind: 'range', message };
}

function requiredText(value: string) {
  return value.trim() ? undefined : { kind: 'required', message: 'movieEditor.validation.required' };
}
