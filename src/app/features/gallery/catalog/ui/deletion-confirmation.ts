import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, filter, finalize, map, type Observable, take } from 'rxjs';
import { ConfirmationDialog, type ConfirmationDialogData } from '@msh-shared/components/confirmation-dialog/confirmation-dialog';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';

export type DeletionRequest = {
  readonly owner: DestroyRef;
  readonly title: string;
  readonly collection?: 'movies' | 'series' | 'wishlist';
};

@Injectable({ providedIn: 'root' })
export class DeletionConfirmation {
  private isOpen = false;
  private readonly floatingPanel = inject(FloatingPanel);

  confirm({ owner, title, collection = 'movies' }: DeletionRequest): Observable<true> {
    if (this.isOpen) return EMPTY;
    this.isOpen = true;
    return this.floatingPanel
      .open<ConfirmationDialog, ConfirmationDialogData, boolean>(ConfirmationDialog, {
        ariaDescribedBy: 'confirmation-message',
        ariaLabelledBy: 'confirmation-title',
        data: {
          cancelKey: 'common.cancel',
          confirmKey: `${collection}.delete.confirm`,
          messageKey: `${collection}.delete.message`,
          messageParams: { title },
          titleKey: `${collection}.delete.title`,
        },
        owner,
        placement: 'center',
      })
      .closed.pipe(
        take(1),
        filter((confirmed) => confirmed === true),
        takeUntilDestroyed(owner),
        map(() => true as const),
        finalize(() => {
          this.isOpen = false;
        }),
      );
  }
}
