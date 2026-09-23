import { Component, computed, input, output } from '@angular/core';
import { ToastId, ToastMessage, ToastType } from '@msh-shared/models/toast.model';

const TOAST_ICONS: Readonly<Record<ToastType, string>> = {
  info: 'i',
  success: '✓',
  warning: '!',
  error: '×',
};

@Component({
  imports: [],
  selector: 'msh-toast',
  styleUrl: './toast.scss',
  templateUrl: './toast.html',
})
export class Toast {
  readonly toast = input.required<ToastMessage>();
  readonly dismissed = output<ToastId>();
  readonly actionRequested = output<ToastId>();

  protected readonly icon = computed(() => TOAST_ICONS[this.toast().type]);
  protected readonly role = computed(() => (this.toast().type === 'warning' || this.toast().type === 'error' ? 'alert' : 'status'));

  protected dismiss(): void {
    this.dismissed.emit(this.toast().id);
  }

  protected activateAction(): void {
    this.actionRequested.emit(this.toast().id);
  }
}
