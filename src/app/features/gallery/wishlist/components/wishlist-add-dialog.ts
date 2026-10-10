import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, type ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { CreateWishlistFromKinopoiskUseCase } from '../application/create-wishlist-from-kinopoisk.use-case';
@Component({
  selector: 'msh-wishlist-add-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  styles: `
    :host {
      display: block;
      padding: 1.5rem;
    }
    form {
      display: grid;
      gap: 1rem;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
  `,
  template: ` <form (submit)="submit($event)" [attr.aria-busy]="pending()">
    <h2 id="wishlist-add-title">{{ 'wishlist.add' | translate }}</h2>
    <label for="wishlist-kp-id">{{ 'movieEditor.fields.kpId' | translate }}</label>
    <input
      #idInput
      id="wishlist-kp-id"
      class="form-control"
      type="text"
      inputmode="numeric"
      [formControl]="kpId"
      [readOnly]="pending()"
      [attr.aria-invalid]="kpId.touched && kpId.invalid"
      aria-describedby="wishlist-id-error"
    />
    <p id="wishlist-id-error" role="status">
      @if (kpId.touched && kpId.invalid) {
        {{ 'wishlist.invalidId' | translate }}
      }
    </p>
    <div class="actions">
      <button class="btn btn-secondary" type="button" [disabled]="pending()" (click)="close()">{{ 'common.cancel' | translate }}</button>
      <button class="btn btn-primary" type="submit" [disabled]="pending()">
        {{ (pending() ? 'wishlist.adding' : 'wishlist.add') | translate }}
      </button>
    </div>
  </form>`,
})
export class WishlistAddDialog {
  protected readonly kpId = new FormControl('', {
    nonNullable: true,
    validators: (control): ValidationErrors | null => validId(control.value),
  });
  protected readonly pending = signal(false);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('idInput');
  private readonly create = inject(CreateWishlistFromKinopoiskUseCase);
  private readonly ref = inject<FloatingPanelRef<string>>(FloatingPanelRef);
  private readonly feedback = inject(GalleryFeedback);
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(() => this.input().nativeElement.focus());
  }
  protected close(): void {
    if (!this.pending()) this.ref.close();
  }
  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.kpId.markAsTouched();
    if (this.pending() || this.kpId.invalid) return;
    this.pending.set(true);
    try {
      const id = await firstValueFrom(this.create.execute(this.kpId.value.trim()).pipe(takeUntilDestroyed(this.destroyRef)));
      this.feedback.success('wishlist.add', 'wishlist.added');
      this.ref.close(id);
    } catch (error: unknown) {
      if (!this.destroyRef.destroyed) {
        this.feedback.error(
          'wishlist.add',
          error instanceof AppError && error.kind === 'conflict' ? 'wishlist.conflict' : 'wishlist.mutationError',
        );
        this.input().nativeElement.focus();
      }
    } finally {
      this.pending.set(false);
    }
  }
}
function validId(value: unknown): ValidationErrors | null {
  return typeof value === 'string' && /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? null
    : { id: true };
}
