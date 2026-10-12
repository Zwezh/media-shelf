import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationFocus {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private keyboard = false;
  private focusHeading = false;

  constructor() {
    const keyboard = (): void => {
      this.keyboard = true;
    };
    const pointer = (): void => {
      this.keyboard = false;
    };
    this.document.addEventListener('keydown', keyboard, true);
    this.document.addEventListener('pointerdown', pointer, true);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', keyboard, true);
      this.document.removeEventListener('pointerdown', pointer, true);
    });
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.focusHeading = event.id > 1 && event.navigationTrigger === 'imperative' && this.keyboard;
        }
      });
  }

  heading(element: HTMLElement | undefined): void {
    if (!this.focusHeading || !element) return;
    element.focus({ preventScroll: true });
    this.focusHeading = false;
  }
}
