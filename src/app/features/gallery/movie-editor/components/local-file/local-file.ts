import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { MEDIA_EXTENSION_OPTIONS, MEDIA_QUALITY_OPTIONS } from '../../../models/media-options';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-local-file',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './local-file.html',
})
export class LocalFile {
  readonly form = input.required<MovieEditorForm>();
  protected readonly extensionOptions = MEDIA_EXTENSION_OPTIONS;
  protected readonly qualityOptions = MEDIA_QUALITY_OPTIONS;
}
