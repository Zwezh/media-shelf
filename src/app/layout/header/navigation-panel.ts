import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationItem } from '@msh-core/navigation';
import { Icon } from '@msh-shared/components/icon/icon';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, NgOptimizedImage, RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'msh-navigation-panel',
  styleUrl: './navigation-panel.scss',
  template: `
    <header>
      <div class="navigation-panel__brand">
        <img ngSrc="logo.svg" width="32" height="32" alt="" />
        <span>MediaShelf</span>
      </div>
      <button class="btn btn-secondary" type="button" [attr.aria-label]="'common.close' | translate" (click)="close()">
        <msh-icon name="close" [size]="24" />
      </button>
    </header>
    <h2 id="main-navigation-title" class="navigation-panel__title">{{ 'header.primaryNavigation' | translate }}</h2>
    <nav [attr.aria-label]="'header.primaryNavigation' | translate">
      @for (item of items; track item.path) {
        <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page" (click)="close()">
          {{ item.labelKey | translate }}
        </a>
      }
    </nav>
  `,
})
export class NavigationPanel {
  protected readonly items = inject(FLOATING_PANEL_DATA) as readonly NavigationItem[];
  private readonly panel = inject(FloatingPanelRef);

  protected close(): void {
    this.panel.close();
  }
}
