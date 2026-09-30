import { inject, Service } from '@angular/core';
import { SettingsRepository } from './settings.repository';

@Service()
export class SettingsStore {
  private readonly repository = inject(SettingsRepository);

  readonly defaultExtension = this.repository.defaultExtension;
  readonly defaultQuality = this.repository.defaultQuality;
  readonly extensionOptions = this.repository.extensionOptions;
  readonly genresForFilters = this.repository.genresForFilters;
  readonly qualityOptions = this.repository.qualityOptions;
  readonly settings = this.repository.settings;
}
