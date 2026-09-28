import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { MEDIA_AGE_RATINGS } from '../../../models/media-options';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-classification-metrics',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './classification-metrics.html',
})
export class ClassificationMetrics {
  readonly form = input.required<MovieEditorForm>();
  protected readonly ageRatings = MEDIA_AGE_RATINGS;
}
