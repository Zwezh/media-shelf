import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ConfirmationDialog } from '@msh-shared/components/confirmation-dialog/confirmation-dialog';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { MovieDeletionCoordinator } from './movie-deletion-coordinator';

describe('MovieDeletionCoordinator', () => {
  it('opens the shared movie deletion dialog and runs the confirmed action once', () => {
    const closed = new Subject<boolean | undefined>();
    const open = vi.fn(() => ({ closed }));
    TestBed.configureTestingModule({ providers: [{ provide: FloatingPanel, useValue: { open } }] });
    const owner = TestBed.inject(DestroyRef);
    const onConfirmed = vi.fn();

    TestBed.inject(MovieDeletionCoordinator).confirm({ onConfirmed, owner, title: 'Arrival' });

    expect(open).toHaveBeenCalledWith(
      ConfirmationDialog,
      expect.objectContaining({
        ariaDescribedBy: 'confirmation-message',
        ariaLabelledBy: 'confirmation-title',
        data: {
          cancelKey: 'common.cancel',
          confirmKey: 'movies.delete.confirm',
          messageKey: 'movies.delete.message',
          messageParams: { title: 'Arrival' },
          titleKey: 'movies.delete.title',
        },
        owner,
        placement: 'center',
      }),
    );

    closed.next(true);
    closed.next(true);

    expect(onConfirmed).toHaveBeenCalledOnce();
  });

  it('does not run the action when deletion is cancelled', () => {
    const closed = new Subject<boolean | undefined>();
    TestBed.configureTestingModule({
      providers: [{ provide: FloatingPanel, useValue: { open: () => ({ closed }) } }],
    });
    const onConfirmed = vi.fn();

    TestBed.inject(MovieDeletionCoordinator).confirm({
      onConfirmed,
      owner: TestBed.inject(DestroyRef),
      title: 'Arrival',
    });
    closed.next(false);

    expect(onConfirmed).not.toHaveBeenCalled();
  });
});
