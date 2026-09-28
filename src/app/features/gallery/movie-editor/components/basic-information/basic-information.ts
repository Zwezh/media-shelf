import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-basic-information',
  styleUrl: '../movie-editor-form-section.scss',
  templateUrl: './basic-information.html',
})
export class BasicInformation {
  readonly form = input.required<MovieEditorForm>();
  readonly genres = input.required<readonly string[]>();
  readonly genresError = input(false);
  readonly genresLoading = input(false);
  readonly selectedGenres = input.required<readonly string[]>();
  readonly genreToggled = output<string>();
}
