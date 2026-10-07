import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ConfirmationDialog } from '@msh-shared/components/confirmation-dialog/confirmation-dialog';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { DeletionConfirmation } from './deletion-confirmation';

describe('DeletionConfirmation', () => {
  it('opens the shared movie deletion dialog and emits a confirmed result once', () => {
    const closed = new Subject<boolean | undefined>();
    const open = vi.fn(() => ({ closed }));
    TestBed.configureTestingModule({ providers: [{ provide: FloatingPanel, useValue: { open } }] });
    const owner = TestBed.inject(DestroyRef);
    const onConfirmed = vi.fn();

    TestBed.inject(DeletionConfirmation).confirm({ owner, title: 'Arrival' }).subscribe(onConfirmed);

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

    TestBed.inject(DeletionConfirmation)
      .confirm({ owner: TestBed.inject(DestroyRef), title: 'Arrival' })
      .subscribe(onConfirmed);
    closed.next(false);

    expect(onConfirmed).not.toHaveBeenCalled();
  });
});

describe('Series deletion confirmation', () => {
  it('uses Series copy and prevents overlapping dialogs', () => {
    const closed = new Subject<boolean | undefined>();
    const open = vi.fn(() => ({ closed }));
    TestBed.configureTestingModule({ providers: [{ provide: FloatingPanel, useValue: { open } }] });
    const confirmation = TestBed.inject(DeletionConfirmation);
    const request = { owner: TestBed.inject(DestroyRef), title: 'Series', collection: 'series' as const };
    const confirmed = vi.fn();
    confirmation.confirm(request).subscribe(confirmed);
    confirmation.confirm(request).subscribe(confirmed);
    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      ConfirmationDialog,
      expect.objectContaining({ data: expect.objectContaining({ titleKey: 'series.delete.title', messageParams: { title: 'Series' } }) }),
    );
    closed.next(false);
    expect(confirmed).not.toHaveBeenCalled();
    confirmation.confirm(request).subscribe(confirmed);
    expect(open).toHaveBeenCalledTimes(2);
  });
});
