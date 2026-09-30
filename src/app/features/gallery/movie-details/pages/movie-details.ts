import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { type MovieDetails } from '../../models/movie-details';
import { MovieDeletionCoordinator } from '../../services/movie-deletion-coordinator';
import { AdditionalInformation } from '../components/additional-information/additional-information';
import { MovieDetailsHero } from '../components/movie-details-hero/movie-details-hero';
import { ProductionAndCast } from '../components/production-and-cast/production-and-cast';
import { RelatedMovieLists } from '../components/related-movie-lists/related-movie-lists';
import { MovieDetailsStore } from '../state/movie-details.store';

@Component({
  imports: [AdditionalInformation, MovieDetailsHero, PageStatus, ProductionAndCast, RelatedMovieLists, RouterLink, TranslatePipe],
  providers: [MovieDetailsStore],
  selector: 'msh-movie-details',
  styleUrl: './movie-details.scss',
  templateUrl: './movie-details.html',
})
export class MovieDetailsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieDeletion = inject(MovieDeletionCoordinator);
  private readonly router = inject(Router);
  protected readonly store = inject(MovieDetailsStore);
  protected readonly breadcrumbTitle = computed(() => this.store.movie()?.title ?? '');

  protected editMovie(movie: MovieDetails): void {
    void this.router.navigate(['/gallery/movies', movie.id, 'edit'], { queryParamsHandling: 'preserve' });
  }

  protected confirmDelete(movie: MovieDetails): void {
    this.movieDeletion
      .confirm({ owner: this.destroyRef, title: movie.title })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.deleteMovie(movie.id));
  }
}
