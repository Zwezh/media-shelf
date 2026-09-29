import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Icon } from '@msh-shared/components/icon/icon';
import { FormValidationMessage } from '@msh-shared/components/form-validation-message/form-validation-message';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { ToastStore } from '@msh-shared/services/toast-store';
import { AuthApi } from '../auth-api';
import { AuthSession } from '../auth-session';

type AuthCredentials = {
  readonly secretKey: string;
};

@Component({
  imports: [FormField, FormValidationMessage, Icon, NgOptimizedImage, TranslatePipe],
  selector: 'msh-auth-dialog',
  styleUrl: './auth-dialog.scss',
  templateUrl: './auth-dialog.html',
})
export class AuthDialog {
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly panelRef = inject<FloatingPanelRef<boolean>>(FloatingPanelRef);
  private readonly toastStore = inject(ToastStore);
  private readonly translate = inject(TranslateService);
  private readonly secretKeyInput = viewChild.required<ElementRef<HTMLInputElement>>('secretKeyInput');

  protected readonly credentials = signal<AuthCredentials>({ secretKey: '' });
  protected readonly credentialsForm = form(this.credentials, (schema) => {
    validate(schema.secretKey, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'auth.validation.secretKeyRequired' },
    );
  });
  protected readonly isSubmitting = signal(false);
  protected readonly showSecret = signal(false);

  constructor() {
    afterNextRender(() => this.secretKeyInput().nativeElement.focus());
  }

  protected close(): void {
    if (!this.isSubmitting()) this.panelRef.close(false);
  }

  protected async signIn(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.isSubmitting()) return;

    await submit(this.credentialsForm, async () => {
      this.isSubmitting.set(true);
      try {
        const token = await firstValueFrom(this.authApi.signIn(this.credentials().secretKey.trim()));
        this.authSession.start(token);
        this.credentials.set({ secretKey: '' });
        this.isSubmitting.set(false);
        this.showToast('success', 'auth.toasts.signInSuccessTitle', 'auth.toasts.signInSuccessMessage');
        this.panelRef.close(true);
      } catch {
        this.isSubmitting.set(false);
        this.showToast('error', 'auth.toasts.signInErrorTitle', 'auth.toasts.signInErrorMessage');
        this.secretKeyInput().nativeElement.focus();
      }
    });
  }

  protected toggleSecretVisibility(): void {
    this.showSecret.update((visible) => !visible);
    this.secretKeyInput().nativeElement.focus();
  }

  private showToast(type: 'error' | 'success', titleKey: string, messageKey: string): void {
    this.toastStore[type]({
      message: String(this.translate.instant(messageKey)),
      title: String(this.translate.instant(titleKey)),
    });
  }
}
