import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { type MovieDetails } from '../../../models/movie-details';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-related-movie-lists',
  styleUrl: './related-movie-lists.scss',
  templateUrl: './related-movie-lists.html',
})
export class RelatedMovieLists {
  readonly movie = input.required<MovieDetails>();
}
