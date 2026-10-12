import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GALLERY_NAVIGATION_ITEMS } from '../gallery.routes';
import { Icon, type IconName } from '@msh-shared/components/icon/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  selector: 'msh-gallery-layout',
  styleUrl: './gallery-layout.scss',
  template: `
    <nav class="gallery-navigation" [attr.aria-label]="'gallery.navigation' | translate">
      <ul>
        @for (item of navigationItems; track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="gallery-navigation__link--active"
              [routerLinkActiveOptions]="{
                paths: item.exact ? 'exact' : 'subset',
                queryParams: 'ignored',
                fragment: 'ignored',
                matrixParams: 'ignored',
              }"
              ariaCurrentWhenActive="page"
            >
              <msh-icon class="gallery-navigation__icon" [name]="icons[item.path]" [size]="22" />
              <span>{{ item.labelKey | translate }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
    <router-outlet />
  `,
})
export class GalleryLayout {
  protected readonly navigationItems = GALLERY_NAVIGATION_ITEMS;
  protected readonly icons: Readonly<Record<string, IconName>> = {
    '/gallery': 'gallery',
    '/gallery/movies': 'view',
    '/gallery/series': 'monitor',
    '/gallery/wishlist': 'heart',
  };
}
