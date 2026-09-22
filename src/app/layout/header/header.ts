import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationItem } from '@msh-core/navigation';

@Component({
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, TranslatePipe],
  selector: 'msh-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly navigationItems = input.required<readonly NavigationItem[]>();
}
