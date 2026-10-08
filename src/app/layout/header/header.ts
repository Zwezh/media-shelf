import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthDialog } from '@msh-core/auth/auth-dialog/auth-dialog';
import { AuthSession } from '@msh-core/auth/auth-session';
import { NavigationItem } from '@msh-core/navigation';
import { Icon } from '@msh-shared/components/icon/icon';
import { FloatingPanel } from '@msh-shared/floating-panel/floating-panel';
import { ToastStore } from '@msh-shared/services/toast-store';
import { LanguageSelector } from './language-selector/language-selector';
import { ThemeSelector } from './theme-selector/theme-selector';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, LanguageSelector, NgOptimizedImage, RouterLink, RouterLinkActive, ThemeSelector, TranslatePipe],
  selector: 'msh-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly navigationItems = input.required<readonly NavigationItem[]>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly floatingPanel = inject(FloatingPanel);
  private readonly toastStore = inject(ToastStore);
  private readonly translate = inject(TranslateService);
  protected readonly authSession = inject(AuthSession);

  protected openSignIn(): void {
    if (this.authSession.isAuthenticated()) return;
    this.floatingPanel.open<AuthDialog, never, boolean>(AuthDialog, {
      ariaDescribedBy: 'auth-dialog-description',
      ariaLabelledBy: 'auth-dialog-title',
      owner: this.destroyRef,
      panelClass: 'auth-dialog-panel',
      placement: 'center',
    });
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
