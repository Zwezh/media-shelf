import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DetailCard } from '@msh-shared/components/detail-card/detail-card';
import { type MovieDetails } from '../../../models/movie-details';

@Component({
  imports: [DatePipe, DetailCard, TranslatePipe],
  selector: 'msh-additional-information',
  styleUrl: './additional-information.scss',
  templateUrl: './additional-information.html',
})
export class AdditionalInformation {
  readonly movie = input.required<MovieDetails>();
}
