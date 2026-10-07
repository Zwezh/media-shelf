import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { EditorFields } from '../../../models/editor-fields';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-relationships-universe',
  styleUrl: '../editor-form-section.scss',
  templateUrl: './relationships-universe.html',
})
export class RelationshipsUniverse {
  readonly form = input.required<EditorFields<'sequelsAndPrequels' | 'similarMovies'>>();
}
