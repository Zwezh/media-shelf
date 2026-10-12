import { DOCUMENT, ViewportScroller } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterOutlet, Scroll } from '@angular/router';
import { NavigationFocus } from '@msh-core/navigation-focus';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(wheel)': 'cancelRestoration()', '(touchstart)': 'cancelRestoration()', '(keydown)': 'cancelRestoration()' },
  imports: [RouterOutlet],
  selector: 'msh-main-content',
  styleUrl: './main-content.scss',
  templateUrl: './main-content.html',
})
export class MainContent {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewport = inject(ViewportScroller);
  private pendingPosition: [number, number] | null = null;

  constructor() {
    inject(NavigationFocus);
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) this.cancelRestoration();
        if (event instanceof Scroll) {
          this.pendingPosition = event.position;
          this.restorePosition();
        }
      });
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.restorePosition());
      observer.observe(this.element.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected cancelRestoration(): void {
    this.pendingPosition = null;
  }

  private restorePosition(): void {
    const position = this.pendingPosition;
    const window = this.document.defaultView;
    if (!position || !window || this.document.documentElement.scrollHeight - window.innerHeight < position[1]) return;
    this.viewport.scrollToPosition(position, { behavior: 'instant' });
    this.pendingPosition = null;
  }
}
