import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';

export type ConfirmationDialogData = {
  readonly cancelKey: string;
  readonly confirmKey: string;
  readonly messageKey: string;
  readonly messageParams?: Readonly<Record<string, string>>;
  readonly titleKey: string;
};

@Component({
  imports: [TranslatePipe],
  selector: 'msh-confirmation-dialog',
  styleUrl: './confirmation-dialog.scss',
  template: `
    <section class="confirmation">
      <header>
        <h2 id="confirmation-title">{{ data.titleKey | translate }}</h2>
      </header>
      <p id="confirmation-message">{{ data.messageKey | translate: data.messageParams }}</p>
      <footer>
        <button #cancelButton class="btn btn-secondary" type="button" (click)="close(false)">
          {{ data.cancelKey | translate }}
        </button>
        <button class="btn btn-danger" type="button" (click)="close(true)">
          {{ data.confirmKey | translate }}
        </button>
      </footer>
    </section>
  `,
})
export class ConfirmationDialog {
  protected readonly data = inject(FLOATING_PANEL_DATA) as ConfirmationDialogData;
  private readonly panelRef = inject<FloatingPanelRef<boolean>>(FloatingPanelRef);
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    afterNextRender(() => this.cancelButton().nativeElement.focus());
  }

  protected close(result: boolean): void {
    this.panelRef.close(result);
  }
}
