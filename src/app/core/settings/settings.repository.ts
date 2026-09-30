import { httpResource } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { type SettingsDto } from './settings.dto';
import { parseSettingsDto } from './settings.parser';

@Service()
export class SettingsRepository {
  private readonly environment = inject(ENVIRONMENT);

  readonly settings = httpResource<SettingsDto>(() => this.toEndpointUrl('settings'), { parse: parseSettingsDto });
  readonly extensionOptions = computed(() => (this.settings.hasValue() ? this.settings.value().extension : []));
  readonly genresForFilters = computed(() =>
    this.settings.hasValue() ? [...this.settings.value().genresForFilters].sort((left, right) => left.localeCompare(right)) : [],
  );
  readonly qualityOptions = computed(() => (this.settings.hasValue() ? this.settings.value().quality : []));
  readonly defaultExtension = computed(() => this.extensionOptions().find((option) => option.default)?.value ?? '');
  readonly defaultQuality = computed(() => this.qualityOptions().find((option) => option.default)?.value ?? '');

  private toEndpointUrl(endpoint: string): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/${endpoint}`;
  }
}
