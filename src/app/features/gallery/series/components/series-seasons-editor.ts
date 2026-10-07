import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import type { ExtensionSettingOption, QualitySettingOption } from '@msh-core/settings/settings.dto';
import { MovieEditorSection } from '../../catalog/components/editor/movie-editor-section/movie-editor-section';
import type { SeasonEditorModel } from '../models/series-editor.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-series-seasons-editor',
  imports: [FormField, FormValidationMessage, TranslatePipe, MovieEditorSection],
  styleUrl: './series-seasons-editor.scss',
  template: `
    <msh-movie-editor-section headingId="series-seasons-title" titleKey="seriesEditor.seasons">
      <div class="seasons-editor">
        <p class="seasons-editor__count">{{ 'seriesEditor.availableCount' | translate }}: {{ availableCount() }}</p>
        @for (season of form(); track season) {
          @let row = season().value();
          <fieldset class="seasons-editor__season">
            <legend>{{ 'seriesEditor.season' | translate: { number: row.seasonNumber } }}</legend>
            <div class="seasons-editor__fields">
              <label class="form-label">
                <span>{{ 'seriesEditor.seasonNumber' | translate }} *</span>
                <input
                  class="form-control"
                  inputmode="numeric"
                  [id]="'season-number-' + row.key"
                  [formField]="season.seasonNumber"
                  [attr.aria-describedby]="'season-number-error-' + row.key"
                />
                <msh-form-validation-message [field]="season.seasonNumber()" [messageId]="'season-number-error-' + row.key" />
              </label>
              <label class="form-label">
                <span>{{ 'seriesEditor.releaseYear' | translate }}</span>
                <input
                  class="form-control"
                  inputmode="numeric"
                  [formField]="season.releaseYear"
                  [attr.aria-describedby]="'season-year-error-' + row.key"
                />
                <msh-form-validation-message [field]="season.releaseYear()" [messageId]="'season-year-error-' + row.key" />
              </label>
              <label class="form-label seasons-editor__availability">
                <input type="checkbox" [formField]="season.isAvailable" />
                <span>{{ 'seriesEditor.isAvailable' | translate }}</span>
              </label>
            </div>
            @if (row.isAvailable) {
              <div class="seasons-editor__fields">
                <label class="form-label">
                  <span>{{ 'movieEditor.fields.quality' | translate }} *</span>
                  <select class="form-control" [formField]="season.qualityId" [attr.aria-describedby]="'season-quality-error-' + row.key">
                    <option value="">{{ 'movieEditor.fields.notSet' | translate }}</option>
                    @if (row.qualityId && !hasQuality(row.qualityId)) {
                      <option [value]="row.qualityId">{{ row.qualityId }}</option>
                    }
                    @for (quality of qualities(); track quality.value) {
                      @if (quality.id) {
                        <option [value]="quality.id">{{ quality.title }}</option>
                      }
                    }
                  </select>
                  <msh-form-validation-message [field]="season.qualityId()" [messageId]="'season-quality-error-' + row.key" />
                </label>
                <label class="form-label">
                  <span>{{ 'movieEditor.fields.extension' | translate }} *</span>
                  <select
                    class="form-control"
                    [formField]="season.extensionId"
                    [attr.aria-describedby]="'season-extension-error-' + row.key"
                  >
                    <option value="">{{ 'movieEditor.fields.notSet' | translate }}</option>
                    @if (row.extensionId && !hasExtension(row.extensionId)) {
                      <option [value]="row.extensionId">{{ row.extensionId }}</option>
                    }
                    @for (extension of extensions(); track extension.value) {
                      @if (extension.id) {
                        <option [value]="extension.id">{{ extension.value }}</option>
                      }
                    }
                  </select>
                  <msh-form-validation-message [field]="season.extensionId()" [messageId]="'season-extension-error-' + row.key" />
                </label>
              </div>
            }
            <button class="btn btn-secondary" type="button" [disabled]="disabled()" (click)="seasonRemoved.emit(row.key)">
              {{ 'seriesEditor.removeSeason' | translate: { number: row.seasonNumber } }}
            </button>
          </fieldset>
        }
        <div class="seasons-editor__error" tabindex="-1" id="seasons-error">
          <msh-form-validation-message [field]="form()()" messageId="seasons-validation-message" />
        </div>
        <button id="add-season" class="btn btn-secondary" type="button" [disabled]="disabled()" (click)="seasonAdded.emit()">
          {{ 'seriesEditor.addSeason' | translate }}
        </button>
      </div>
    </msh-movie-editor-section>
  `,
})
export class SeriesSeasonsEditor {
  readonly form = input.required<FieldTree<readonly SeasonEditorModel[]>>();
  readonly qualities = input.required<readonly QualitySettingOption[]>();
  readonly extensions = input.required<readonly ExtensionSettingOption[]>();
  readonly disabled = input(false);
  readonly seasonAdded = output<void>();
  readonly seasonRemoved = output<number>();
  protected readonly availableCount = computed(
    () =>
      this.form()()
        .value()
        .filter((season) => season.isAvailable).length,
  );
  protected hasQuality(id: string): boolean {
    return this.qualities().some((option) => option.id === id);
  }
  protected hasExtension(id: string): boolean {
    return this.extensions().some((option) => option.id === id);
  }
}
