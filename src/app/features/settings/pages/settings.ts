import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { disabled, form, FormField, required, submit } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from '@msh-core/auth/auth-session';
import type { SettingsDto } from '@msh-core/settings/settings.dto';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { Icon } from '@msh-shared/components/icon/icon';
import { PageStatus } from '@msh-shared/components/page-status/page-status';
import { ToastStore } from '@msh-shared/services/toast-store';
import { EMPTY_SETTINGS_FORM_MODEL, type SettingsFormModel, type SettingsOperation } from './settings.model';
import { genresEqual, settingsFormModelsEqual, sortGenres, toSettingsFormModel } from './settings.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, Icon, PageStatus, TranslatePipe],
  selector: 'msh-settings',
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly auth = inject(AuthSession);
  protected readonly settings = inject(SettingsStore);
  private readonly toasts = inject(ToastStore);
  private readonly operation = signal<SettingsOperation>('idle');

  protected readonly model = linkedSignal<SettingsDto | undefined, SettingsFormModel>({
    source: () => (this.settings.settings.hasValue() ? this.settings.settings.value() : undefined),
    computation: (settings) => (settings ? toSettingsFormModel(settings) : EMPTY_SETTINGS_FORM_MODEL),
  });
  protected readonly genres = linkedSignal<SettingsDto | undefined, string[]>({
    source: () => (this.settings.settings.hasValue() ? this.settings.settings.value() : undefined),
    computation: (settings) => (settings ? sortGenres(settings.genresForFilters) : []),
  });
  protected readonly isBusy = computed(() => this.operation() !== 'idle');
  protected readonly settingsForm = form(this.model, (schema) => {
    required(schema.defaultExtension);
    required(schema.defaultQuality);
    disabled(schema.defaultExtension, { when: () => !this.auth.isAuthenticated() || this.isBusy() });
    disabled(schema.defaultQuality, { when: () => !this.auth.isAuthenticated() || this.isBusy() });
    disabled(schema.newGenre, { when: () => !this.auth.isAuthenticated() || this.isBusy() });
  });
  protected readonly isRefilling = computed(() => this.operation() === 'refilling');
  protected readonly isSaving = computed(() => this.operation() === 'saving');
  protected readonly canAddGenre = computed(() => {
    const candidate = this.model().newGenre.trim();
    return (
      this.auth.isAuthenticated() &&
      !this.isBusy() &&
      !!candidate &&
      !this.genres().some((genre) => genre.localeCompare(candidate, undefined, { sensitivity: 'accent' }) === 0)
    );
  });
  protected readonly hasChanges = computed(() => {
    if (!this.settings.settings.hasValue()) return false;
    const current = this.settings.settings.value();
    return (
      !settingsFormModelsEqual(this.model(), toSettingsFormModel(current)) ||
      !genresEqual(this.genres(), sortGenres(current.genresForFilters))
    );
  });
  protected readonly saveDisabled = computed(
    () => !this.auth.isAuthenticated() || this.isBusy() || this.settingsForm().invalid() || !this.hasChanges(),
  );

  constructor() {
    effect(() => {
      if (this.settings.settings.isLoading()) return;
      if (this.settings.settings.error()) {
        this.toasts.error({ message: 'settings.loadErrorMessage', title: 'settings.loadErrorTitle' });
      } else if (this.settings.settings.hasValue()) {
        this.toasts.success({ message: 'settings.loadSuccessMessage', title: 'settings.loadSuccessTitle' });
      }
    });
  }

  protected addGenre(event?: Event): void {
    event?.preventDefault();
    if (!this.canAddGenre()) return;
    const genre = this.model().newGenre.trim();
    this.genres.update((genres) => sortGenres([...genres, genre]));
    this.model.update((model) => ({ ...model, newGenre: '' }));
  }

  protected discard(): void {
    if (this.isBusy() || !this.settings.settings.hasValue()) return;
    const current = this.settings.settings.value();
    this.model.set(toSettingsFormModel(current));
    this.genres.set(sortGenres(current.genresForFilters));
  }

  protected async refillGenres(): Promise<void> {
    if (!this.auth.isAuthenticated() || this.isBusy()) return;
    this.operation.set('refilling');
    try {
      const genres = await firstValueFrom(this.settings.refillGenres());
      this.genres.set([...genres]);
      this.toasts.success({ message: 'settings.toasts.refillSuccessMessage', title: 'settings.toasts.refillSuccessTitle' });
    } catch {
      this.toasts.error({ message: 'settings.toasts.refillErrorMessage', title: 'settings.toasts.refillErrorTitle' });
    } finally {
      this.operation.set('idle');
    }
  }

  protected removeGenre(genre: string): void {
    if (!this.auth.isAuthenticated() || this.isBusy()) return;
    this.genres.update((genres) => genres.filter((item) => item !== genre));
  }

  protected retry(): void {
    this.settings.settings.reload();
  }

  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.saveDisabled() || !this.settings.settings.hasValue()) return;
    await submit(this.settingsForm, async () => {
      this.operation.set('saving');
      try {
        const current = this.settings.settings.value();
        if (!current) return;
        const draft = this.model();
        await firstValueFrom(
          this.settings.update({
            ...current,
            extension: current.extension.map((option) => ({ ...option, default: option.value === draft.defaultExtension })),
            genresForFilters: [...this.genres()],
            quality: current.quality.map((option) => ({ ...option, default: option.value === draft.defaultQuality })),
          }),
        );
        this.toasts.success({ message: 'settings.toasts.saveSuccessMessage', title: 'settings.toasts.saveSuccessTitle' });
      } catch {
        this.toasts.error({ message: 'settings.toasts.saveErrorMessage', title: 'settings.toasts.saveErrorTitle' });
      } finally {
        this.operation.set('idle');
      }
    });
  }
}
