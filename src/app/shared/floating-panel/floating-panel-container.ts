import {
  Component,
  computed,
  ElementRef,
  EnvironmentInjector,
  Injector,
  input,
  output,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { FloatingPanelPlacement } from './floating-panel-config';

@Component({
  host: { '(window:resize)': 'positionAtAnchor()' },
  selector: 'msh-floating-panel-container',
  styleUrl: './floating-panel.scss',
  template: `
    <dialog
      #dialog
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledBy() || null"
      [class]="dialogClass()"
      (cancel)="handleCancel($event)"
      (pointerdown)="handleBackdropPointerDown($event)"
    >
      <ng-template #outlet />
    </dialog>
  `,
})
export class FloatingPanelContainer {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });

  readonly ariaLabel = input('');
  readonly ariaLabelledBy = input('');
  readonly anchor = input<HTMLElement | undefined>();
  readonly closeOnBackdrop = input(true);
  readonly closeOnEscape = input(true);
  readonly panelClass = input<readonly string[]>([]);
  readonly placement = input<FloatingPanelPlacement>('center');
  readonly dismissed = output<void>();

  protected readonly dialogClass = computed(() =>
    ['floating-panel', `floating-panel--${this.placement()}`, ...this.panelClass()].join(' '),
  );

  attach<TComponent>(component: Type<TComponent>, injector: Injector, environmentInjector: EnvironmentInjector): TComponent {
    return this.outlet().createComponent(component, { environmentInjector, injector }).instance;
  }

  show(): void {
    const dialog = this.dialog().nativeElement;
    this.positionAtAnchor();
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  protected positionAtAnchor(): void {
    const anchor = this.anchor();
    if (!anchor || this.placement() !== 'anchored-responsive') return;

    const bounds = anchor.getBoundingClientRect();
    const viewportWidth = this.dialog().nativeElement.ownerDocument.documentElement.clientWidth;
    this.dialog().nativeElement.style.setProperty('--floating-panel-anchor-top', `${bounds.bottom}px`);
    this.dialog().nativeElement.style.setProperty('--floating-panel-anchor-right', `${Math.max(0, viewportWidth - bounds.right)}px`);
  }

  hide(): void {
    const dialog = this.dialog().nativeElement;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    if (this.closeOnEscape()) this.dismissed.emit();
  }

  protected handleBackdropPointerDown(event: PointerEvent): void {
    if (this.closeOnBackdrop() && event.target === this.dialog().nativeElement) this.dismissed.emit();
  }
}
