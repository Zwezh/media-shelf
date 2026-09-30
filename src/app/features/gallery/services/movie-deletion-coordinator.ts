import { DestroyRef, inject, Service } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, type Observable, take } from 'rxjs';
import { ConfirmationDialog, type ConfirmationDialogData } from '@msh-shared/components/confirmation-dialog/confirmation-dialog';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';

export type MovieDeletionRequest = {
  readonly owner: DestroyRef;
  readonly title: string;
};

@Service()
export class MovieDeletionCoordinator {
  private readonly floatingPanel = inject(FloatingPanel);

  confirm({ owner, title }: MovieDeletionRequest): Observable<true> {
    return this.floatingPanel
      .open<ConfirmationDialog, ConfirmationDialogData, boolean>(ConfirmationDialog, {
        ariaDescribedBy: 'confirmation-message',
        ariaLabelledBy: 'confirmation-title',
        data: {
          cancelKey: 'common.cancel',
          confirmKey: 'movies.delete.confirm',
          messageKey: 'movies.delete.message',
          messageParams: { title },
          titleKey: 'movies.delete.title',
        },
        owner,
        placement: 'center',
      })
      .closed.pipe(
        take(1),
        filter((confirmed) => confirmed === true),
        takeUntilDestroyed(owner),
        map(() => true as const),
      );
  }
}
