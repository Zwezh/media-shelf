import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
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
}
