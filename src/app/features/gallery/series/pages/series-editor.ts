import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, linkedSignal } from '@angular/core';
import { FormField, form, required, submit, validate, applyEach, applyWhen } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import { BasicInformation } from '../../catalog/components/editor/basic-information/basic-information';
import { ClassificationMetrics } from '../../catalog/components/editor/classification-metrics/classification-metrics';
import { ArtworkAssets } from '../../catalog/components/editor/artwork-assets/artwork-assets';
import { ProductionCast } from '../../catalog/components/editor/production-cast/production-cast';
import { RelationshipsUniverse } from '../../catalog/components/editor/relationships-universe/relationships-universe';
import { MovieEditorSection } from '../../catalog/components/editor/movie-editor-section/movie-editor-section';
import { SeriesSeasonsEditor } from '../components/series-seasons-editor';
import { SeriesEditorStore } from '../state/series-editor.store';
import { toSeriesDraft } from '../utils/series-editor.converter';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-series-editor',
  providers: [SeriesEditorStore],
  imports: [
    FormField,
    FormValidationMessage,
    RouterLink,
    TranslatePipe,
    PageStatus,
    RequiresAuth,
    BasicInformation,
    ClassificationMetrics,
    ArtworkAssets,
    ProductionCast,
    RelationshipsUniverse,
    MovieEditorSection,
    SeriesSeasonsEditor,
  ],
  templateUrl: './series-editor.html',
  styleUrls: [
    '../../catalog/components/editor/movie-editor.scss',
    '../../catalog/components/editor/movie-editor-responsive.scss',
    './series-editor.scss',
  ],
})
export class SeriesEditorPage {
  protected readonly store = inject(SeriesEditorStore);
  protected readonly settings = inject(SettingsStore);
  private readonly injector = inject(Injector);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly model = linkedSignal(() => this.store.seed());
  protected readonly editorForm = form(this.model, (schema) => {
    required(schema.name, { message: 'movieEditor.validation.required' });
    validate(schema.name, ({ value }) => (value().trim() ? undefined : { kind: 'required', message: 'movieEditor.validation.required' }));
    required(schema.addedDate, { message: 'movieEditor.validation.required' });
    for (const field of [schema.startYear, schema.endYear]) validate(field, ({ value }) => validNumber(value(), 1, 9999));
    for (const field of [schema.announcedSeasonCount, schema.movieLength])
      validate(field, ({ value }) => validNumber(value(), 0, field === schema.movieLength ? 100000 : 10000));
    validate(schema.rating, ({ value }) => validNumber(value(), 0, 10, false));
    validate(schema.ageRating, ({ value }) => validNumber(value(), 0, 21));
    validate(schema.kpId, ({ value }) =>
      !value().trim() || validProviderId(value()) ? undefined : { kind: 'id', message: 'seriesEditor.invalidId' },
    );
    for (const field of [schema.addedDate, schema.releaseDate])
      validate(field, ({ value }) => {
        const date = value();
        if (!date) return undefined;
        return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date
          ? undefined
          : { kind: 'date', message: 'seriesEditor.invalidDate' };
      });
    validate(schema.endYear, ({ value, valueOf }) =>
      !value().trim() ||
      (valueOf(schema.productionStatus) === 'finished' &&
        valueOf(schema.startYear).trim() &&
        Number(value()) >= Number(valueOf(schema.startYear)))
        ? undefined
        : { kind: 'range', message: 'seriesEditor.invalidRange' },
    );
    applyEach(schema.seasons, (season) => {
      required(season.seasonNumber, { message: 'movieEditor.validation.required' });
      validate(season.seasonNumber, ({ value }) => validNumber(value(), 0, 10000));
      validate(season.releaseYear, ({ value }) => validNumber(value(), 1, 9999));
      applyWhen(
        season,
        ({ value }) => value().isAvailable,
        (availableSeason) => {
          required(availableSeason.qualityId, { message: 'movieEditor.validation.required' });
          required(availableSeason.extensionId, { message: 'movieEditor.validation.required' });
        },
      );
    });
    validate(schema.seasons, ({ value }) =>
      new Set(value().map((season) => Number(season.seasonNumber))).size === value().length
        ? undefined
        : { kind: 'duplicate', message: 'seriesEditor.duplicateSeasons' },
    );
  });
  protected readonly selectedQualities = computed(() =>
    [
      ...new Set(
        this.model()
          .seasons.filter((season) => season.isAvailable)
          .map((season) => season.qualityId)
          .filter(Boolean),
      ),
    ].map((id) => ({
      id,
      title: this.settings.qualityOptions().find((option) => option.id === id)?.title ?? id,
    })),
  );
  protected readonly titleKey = computed(() => (this.store.mode() === 'add' ? 'seriesEditor.addTitle' : 'seriesEditor.editTitle'));
  protected readonly canAutofill = computed(() => validProviderId(this.model().kpId) && !this.store.isBusy());

  constructor() {
    afterNextRender(() => this.element.nativeElement.querySelector<HTMLElement>('h1')?.focus());
  }

  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.store.isBusy()) return;
    await submit(this.editorForm, async () => {
      this.store.save(toSeriesDraft(this.model()));
    });
    const firstError = this.editorForm().errorSummary()[0];
    if (firstError?.fieldTree === this.editorForm.seasons) this.element.nativeElement.querySelector<HTMLElement>('#seasons-error')?.focus();
    else firstError?.fieldTree().focusBoundControl();
  }
  protected autofill(): void {
    if (!this.canAutofill()) return;
    this.store.autofill({ id: this.model().kpId, currentModel: this.model });
  }
  protected toggleGenre(genre: string): void {
    this.model.update((model) => ({
      ...model,
      genres: model.genres.includes(genre) ? model.genres.filter((value) => value !== genre) : [...model.genres, genre],
    }));
  }
  protected addSeason(): void {
    this.model.update((model) => ({
      ...model,
      seasons: [
        ...model.seasons,
        {
          key: Math.max(-1, ...model.seasons.map((season) => season.key)) + 1,
          seasonNumber: String(Math.max(0, ...model.seasons.map((season) => Number(season.seasonNumber))) + 1),
          releaseYear: '',
          isAvailable: false,
          qualityId: '',
          extensionId: '',
        },
      ],
    }));
    afterNextRender(() => this.element.nativeElement.querySelector<HTMLElement>('.seasons-editor__season:last-of-type input')?.focus(), {
      injector: this.injector,
    });
  }
  protected removeSeason(key: number): void {
    this.model.update((model) => ({ ...model, seasons: model.seasons.filter((season) => season.key !== key) }));
    this.element.nativeElement.querySelector<HTMLButtonElement>('#add-season')?.focus();
  }
}
function validNumber(value: string, min: number, max: number, integer = true): { kind: string; message: string } | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && (!integer || Number.isInteger(number)) && number >= min && number <= max
    ? undefined
    : { kind: 'range', message: 'seriesEditor.invalidNumber' };
}
function validProviderId(value: string): boolean {
  return /^[1-9]\d*$/.test(value) && value.length <= 16 && BigInt(value) <= BigInt(Number.MAX_SAFE_INTEGER);
}
