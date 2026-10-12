import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { AuthDialog } from '@msh-core/auth/auth-dialog/auth-dialog';
import { AuthSession } from '@msh-core/auth/auth-session';
import { NavigationItem } from '@msh-core/navigation';
import { Icon, type IconName } from '@msh-shared/components/icon/icon';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { ToastStore } from '@msh-shared/services/toast-store';
import { LanguageSelector } from './language-selector/language-selector';
import { ThemeSelector } from './theme-selector/theme-selector';

@Component({
  host: { '(keydown.escape)': 'closeSearch()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, LanguageSelector, NgOptimizedImage, RouterLink, RouterLinkActive, ThemeSelector, TranslatePipe],
  selector: 'msh-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly navigationItems = input.required<readonly NavigationItem[]>();
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly toastStore = inject(ToastStore);
  private readonly translate = inject(TranslateService);
  protected readonly searchOpen = signal(false);
  protected readonly signInLoading = signal(false);
  private readonly searchBlock = viewChild<ElementRef<HTMLElement>>('searchBlock');
  private readonly searchTrigger = viewChild<ElementRef<HTMLButtonElement>>('searchTrigger');
  protected readonly navigationIcons: Readonly<Partial<Record<string, IconName>>> = {
    '/gallery': 'gallery',
    '/statistics': 'statistics',
    '/settings': 'settings',
    '/about': 'info',
  };

  constructor() {
    afterRenderEffect(() => {
      if (this.searchOpen()) this.searchBlock()?.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
    });
  }

  protected closeSearch(): void {
    if (!this.searchOpen()) return;
    this.searchOpen.set(false);
    afterNextRender(() => this.searchTrigger()?.nativeElement.focus(), { injector: this.injector });
  }

  protected readonly authSession = inject(AuthSession);

  protected async openSignIn(): Promise<void> {
    if (this.authSession.isAuthenticated() || this.signInLoading()) return;
    this.signInLoading.set(true);
    try {
      const { AuthDialog } = await import('@msh-core/auth/auth-dialog/auth-dialog');
      if (this.destroyRef.destroyed || this.authSession.isAuthenticated()) return;
      this.floatingPanel.open<AuthDialog, never, boolean>(AuthDialog, {
        ariaDescribedBy: 'auth-dialog-description',
        ariaLabelledBy: 'auth-dialog-title',
        owner: this.destroyRef,
        panelClass: 'auth-dialog-panel',
        placement: 'center',
      });
    } catch {
      if (!this.destroyRef.destroyed) {
        this.toastStore.error({
          title: String(this.translate.instant('auth.toasts.signInErrorTitle')),
          message: String(this.translate.instant('auth.toasts.dialogLoadErrorMessage')),
        });
      }
    } finally {
      this.signInLoading.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    try {
      await this.authSession.signOut();
    } catch {
      this.toastStore.error({
        message: String(this.translate.instant('auth.toasts.signOutErrorMessage')),
        title: String(this.translate.instant('auth.toasts.signOutErrorTitle')),
      });
      return;
    }
    this.toastStore.success({
      message: String(this.translate.instant('auth.toasts.signOutSuccessMessage')),
      title: String(this.translate.instant('auth.toasts.signOutSuccessTitle')),
    });
  }
}
