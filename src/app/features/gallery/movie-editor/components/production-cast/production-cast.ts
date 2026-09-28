import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-production-cast',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './production-cast.html',
})
export class ProductionCast {
  readonly form = input.required<MovieEditorForm>();
}
