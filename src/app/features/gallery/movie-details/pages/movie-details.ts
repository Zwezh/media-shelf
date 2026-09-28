import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationDialog, type ConfirmationDialogData } from '@msh-shared/components/confirmation-dialog/confirmation-dialog';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { filter, take } from 'rxjs';
import { type MovieDetails } from '../../models/movie-details';
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
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly router = inject(Router);
  protected readonly store = inject(MovieDetailsStore);
  protected readonly breadcrumbTitle = computed(() => this.store.movie()?.title ?? '');

  protected editMovie(movie: MovieDetails): void {
    void this.router.navigate(['/gallery/movies', movie.id, 'edit'], { queryParamsHandling: 'preserve' });
  }

  protected confirmDelete(movie: MovieDetails): void {
    this.floatingPanel
      .open<ConfirmationDialog, ConfirmationDialogData, boolean>(ConfirmationDialog, {
        ariaDescribedBy: 'confirmation-message',
        ariaLabelledBy: 'confirmation-title',
        data: {
          cancelKey: 'common.cancel',
          confirmKey: 'movieDetails.delete.confirm',
          messageKey: 'movieDetails.delete.message',
          messageParams: { title: movie.title },
          titleKey: 'movieDetails.delete.title',
        },
        owner: this.destroyRef,
        placement: 'center',
      })
      .closed.pipe(
        take(1),
        filter((confirmed) => confirmed === true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.store.deleteMovie(movie.id));
  }
}
