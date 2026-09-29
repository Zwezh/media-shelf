import { httpResource } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { type SettingsDto } from './settings.dto';
import { parseSettingsDto } from './settings.parser';

@Service()
export class SettingsApi {
  private readonly environment = inject(ENVIRONMENT);

  readonly settings = httpResource<SettingsDto>(() => this.toEndpointUrl('settings'), { parse: parseSettingsDto });
  readonly genresForFilters = computed(() =>
    this.settings.hasValue() ? [...this.settings.value().genresForFilters].sort((left, right) => left.localeCompare(right)) : [],
  );

  private toEndpointUrl(endpoint: string): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/${endpoint}`;
  }
}
