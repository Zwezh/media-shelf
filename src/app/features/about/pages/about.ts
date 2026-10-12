import { NavigationFocus } from '@msh-core/navigation-focus';
import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { APP_VERSION } from '@msh-core/config/app-version';
import { PwaInstallation } from '../components/pwa-installation/pwa-installation';
import {
  APP_HISTORY,
  BACKEND_REPOSITORY_URL,
  CURRENT_FEATURES,
  DEPENDENCY_GROUPS,
  LEGACY_APP_URL,
  REPOSITORY_URL,
  WINFORMS_REFERENCE_URL,
} from '../about-content';

@Component({
  selector: 'msh-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, PwaInstallation, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private readonly navigationFocus = inject(NavigationFocus);
  protected readonly version = APP_VERSION;
  protected readonly history = APP_HISTORY;
  protected readonly features = CURRENT_FEATURES;
  protected readonly dependencies = DEPENDENCY_GROUPS;
  protected readonly repositoryUrl = REPOSITORY_URL;
  protected readonly backendRepositoryUrl = BACKEND_REPOSITORY_URL;
  protected readonly legacyUrl = LEGACY_APP_URL;
  protected readonly winFormsReference = WINFORMS_REFERENCE_URL;
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => this.navigationFocus.heading(this.heading()?.nativeElement));
  }
}
