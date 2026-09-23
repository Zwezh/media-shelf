import { Component } from '@angular/core';
import { APP_VERSION } from '@msh-core/config/app-version';
import { Footer } from '@msh-layout/footer/footer';
import { Header } from '@msh-layout/header/header';
import { MainContent } from '@msh-layout/main-content/main-content';
import { ToastViewport } from '@msh-shared/components/toast-viewport/toast-viewport';
import { APP_NAVIGATION_ITEMS } from './app.routes';

@Component({
  imports: [Footer, Header, MainContent, ToastViewport],
  selector: 'msh-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly navigationItems = APP_NAVIGATION_ITEMS;
  protected readonly version = APP_VERSION;
}
