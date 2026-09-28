import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import type { MovieEditorForm } from '../../models/movie-editor-form.model';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  imports: [FormField, MovieEditorSection, TranslatePipe],
  selector: 'msh-movie-editor-artwork-assets',
  styleUrl: './artwork-assets.scss',
  templateUrl: './artwork-assets.html',
})
export class ArtworkAssets {
  readonly backdropUrl = input('');
  readonly canAutofill = input(false);
  readonly form = input.required<MovieEditorForm>();
  readonly isAutofilling = input(false);
  readonly movieTitle = input('');
  readonly posterUrl = input('');
  readonly autofillRequested = output<void>();

  protected useImageFallback(event: Event): void {
    (event.target as HTMLImageElement).hidden = true;
  }
}
