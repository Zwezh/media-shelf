import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { MEDIA_AGE_RATINGS } from '@msh-features/gallery/models/media-options';
import type { EditorFields } from '../../../models/editor-fields';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-classification-metrics',
  styleUrl: '../editor-form-section.scss',
  templateUrl: './classification-metrics.html',
})
export class ClassificationMetrics {
  readonly form = input.required<EditorFields<'rating' | 'ageRating' | 'movieLength'>>();
  protected readonly ageRatings = MEDIA_AGE_RATINGS;
}
