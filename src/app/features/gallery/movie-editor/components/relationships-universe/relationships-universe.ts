import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-relationships-universe',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './relationships-universe.html',
})
export class RelationshipsUniverse {
  readonly form = input.required<MovieEditorForm>();
}
