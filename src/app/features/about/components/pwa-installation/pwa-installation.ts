import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Pwa } from '@msh-core/pwa/pwa';

@Component({
  selector: 'msh-pwa-installation',
  host: { '[hidden]': '!pwa.mobilePlatform' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './pwa-installation.html',
  styleUrl: './pwa-installation.scss',
})
export class PwaInstallation {
  protected readonly pwa = inject(Pwa);
}
