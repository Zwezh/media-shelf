import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { ExtensionSettingOption, QualitySettingOption } from '@msh-core/settings/settings.dto';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-local-file',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './local-file.html',
})
export class LocalFile {
  readonly extensionOptions = input.required<readonly ExtensionSettingOption[]>();
  readonly form = input.required<MovieEditorForm>();
  readonly qualityOptions = input.required<readonly QualitySettingOption[]>();
}
