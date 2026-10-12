import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BrowserStorage } from '@msh-core/storage/browser-storage';
import { StorageKey } from '@msh-core/storage/storage-key';
import { ToastStore } from '@msh-shared/services/toast-store';
import { Pwa } from '@msh-core/pwa/pwa';

@Component({
  selector: 'msh-pwa-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './pwa-status.html',
  styleUrl: './pwa-status.scss',
})
export class PwaStatus {
  protected readonly pwa = inject(Pwa);
  private readonly storage = inject(BrowserStorage);
  private readonly toasts = inject(ToastStore);
  private readonly translate = inject(TranslateService);

  constructor() {
    afterNextRender(() => {
      if (!this.pwa.mobilePlatform || this.pwa.installed() || this.storage.get(StorageKey.PwaInstallationDismissed) === 'true') return;
      this.toasts.info({
        title: String(this.translate.instant('pwa.title')),
        message: String(this.translate.instant('pwa.' + this.pwa.mobilePlatform)),
        autoHide: false,
        closable: true,
        onDismiss: () => this.storage.set(StorageKey.PwaInstallationDismissed, 'true'),
      });
    });
  }
}
