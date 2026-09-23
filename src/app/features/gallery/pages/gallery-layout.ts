import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GALLERY_NAVIGATION_ITEMS } from '../gallery.routes';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  selector: 'msh-gallery-layout',
  styleUrl: './gallery-layout.scss',
  template: `
    <nav class="gallery-navigation" [attr.aria-label]="'gallery.navigation' | translate">
      <ul>
        @for (item of navigationItems; track item.path) {
          <li>
            <a [routerLink]="item.path" routerLinkActive="gallery-navigation__link--active" ariaCurrentWhenActive="page">{{
              item.labelKey | translate
            }}</a>
          </li>
        }
      </ul>
    </nav>
    <router-outlet />
  `,
})
export class GalleryLayout {
  protected readonly navigationItems = GALLERY_NAVIGATION_ITEMS;
}
