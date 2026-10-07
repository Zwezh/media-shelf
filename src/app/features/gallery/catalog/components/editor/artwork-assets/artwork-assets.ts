import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { RequiresAuth } from '@msh-shared/directives/requires-auth';
import type { EditorFields } from '../../../models/editor-fields';
import { MovieEditorSection } from '../movie-editor-section/movie-editor-section';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormValidationMessage, MovieEditorSection, RequiresAuth, TranslatePipe],
  selector: 'msh-movie-editor-artwork-assets',
  styleUrl: './artwork-assets.scss',
  templateUrl: './artwork-assets.html',
})
export class ArtworkAssets {
  readonly backdropUrl = input('');
  readonly canAutofill = input(false);
  readonly form = input.required<EditorFields<'kpId' | 'posterUrl' | 'backdropUrl'>>();
  readonly isAutofilling = input(false);
  readonly movieTitle = input('');
  readonly posterUrl = input('');
  readonly autofillRequested = output<void>();

  protected useImageFallback(event: Event): void {
    (event.target as HTMLImageElement).hidden = true;
  }
}
