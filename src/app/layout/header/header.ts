import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '@msh-core/navigation';

@Component({
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  selector: 'msh-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly navigationItems = input.required<readonly NavigationItem[]>();
}
