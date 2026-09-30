import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastStore } from '@msh-shared/services/toast-store';

@Service()
export class MovieFeedback {
  private readonly toastStore = inject(ToastStore);
  private readonly translate = inject(TranslateService);

  success(titleKey: string, messageKey: string): void {
    this.show('success', titleKey, messageKey);
  }

  error(titleKey: string, messageKey: string): void {
    this.show('error', titleKey, messageKey);
  }

  private show(type: 'error' | 'success', titleKey: string, messageKey: string): void {
    this.toastStore[type]({
      message: String(this.translate.instant(messageKey)),
      title: String(this.translate.instant(titleKey)),
    });
  }
}
