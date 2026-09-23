import { Component, inject } from '@angular/core';
import { Toast } from '@msh-shared/components/toast/toast';
import { ToastStore } from '@msh-shared/services/toast-store';

@Component({
  imports: [Toast],
  selector: 'msh-toast-viewport',
  styleUrl: './toast-viewport.scss',
  templateUrl: './toast-viewport.html',
  host: {
    'aria-label': 'Notifications',
    role: 'region',
  },
})
export class ToastViewport {
  protected readonly toastStore = inject(ToastStore);
}
