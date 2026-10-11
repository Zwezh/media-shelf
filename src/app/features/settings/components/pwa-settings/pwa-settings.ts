import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Pwa } from '@msh-core/pwa/pwa';

@Component({
  selector: 'msh-pwa-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './pwa-settings.html',
  styleUrl: './pwa-settings.scss',
})
export class PwaSettings {
  protected readonly pwa = inject(Pwa);
}
