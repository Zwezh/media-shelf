import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import type { EditorFields } from '../../../models/editor-fields';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-basic-information',
  styleUrl: '../editor-form-section.scss',
  templateUrl: './basic-information.html',
})
export class BasicInformation {
  readonly form = input.required<EditorFields<'name' | 'enName' | 'genres' | 'description'>>();
  readonly genres = input.required<readonly string[]>();
  readonly genresError = input(false);
  readonly genresLoading = input(false);
  readonly selectedGenres = input.required<readonly string[]>();
  readonly genreToggled = output<string>();
}
