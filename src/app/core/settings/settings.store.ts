import { inject, Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { type SettingsDto } from './settings.dto';
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

  refillGenres(): Observable<readonly string[]> {
    return this.repository.refillGenres();
  }

  update(settings: SettingsDto): Observable<SettingsDto> {
    return this.repository.update(settings);
  }
}
