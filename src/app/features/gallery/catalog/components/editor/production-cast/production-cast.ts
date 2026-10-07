import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import type { EditorFields } from '../../../models/editor-fields';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormValidationMessage, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-production-cast',
  styleUrl: '../editor-form-section.scss',
  templateUrl: './production-cast.html',
})
export class ProductionCast {
  readonly form = input.required<EditorFields<'directors' | 'countries' | 'actors'>>();
}
