import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Service } from '@angular/core';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { toAppError } from '@msh-core/http/app-error';
import { catchError, map, type Observable, tap, throwError } from 'rxjs';
import { type SettingsDto } from './settings.dto';
import { parseSettingsDto } from './settings.parser';

@Service()
export class SettingsRepository {
  private readonly environment = inject(ENVIRONMENT);
  private readonly http = inject(HttpClient);

  readonly settings = httpResource<SettingsDto>(() => this.settingsUrl, { parse: parseSettingsDto });
  readonly extensionOptions = computed(() => (this.settings.hasValue() ? this.settings.value().extension : []));
  readonly genresForFilters = computed(() =>
    this.settings.hasValue() ? [...this.settings.value().genresForFilters].sort((left, right) => left.localeCompare(right)) : [],
  );
  readonly qualityOptions = computed(() => (this.settings.hasValue() ? this.settings.value().quality : []));
  readonly defaultExtension = computed(() => this.extensionOptions().find((option) => option.default)?.value ?? '');
  readonly defaultQuality = computed(() => this.qualityOptions().find((option) => option.default)?.value ?? '');

  refillGenres(): Observable<readonly string[]> {
    return this.http.get<unknown>(this.toEndpointUrl('movies/genres')).pipe(
      map(parseGenresResponse),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  update(settings: SettingsDto): Observable<SettingsDto> {
    return this.http.put<unknown>(this.settingsUrl, toTransportDto(settings)).pipe(
      map(parseSettingsDto),
      tap((updatedSettings) => this.settings.set(updatedSettings)),
      catchError((error: unknown) => throwError(() => toAppError(error))),
    );
  }

  private get settingsUrl(): string {
    return this.toEndpointUrl('settings');
  }

  private toEndpointUrl(endpoint: string): string {
    return `${this.environment.apiUrl.replace(/\/$/, '')}/${endpoint}`;
  }
}

function toTransportDto(settings: SettingsDto): Omit<SettingsDto, 'id'> & { readonly _id: string } {
  const { id, ...values } = settings;
  return { ...values, _id: id };
}

function parseGenresResponse(value: unknown): readonly string[] {
  const genres = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)['genres']
      : undefined;
  if (!Array.isArray(genres) || genres.some((genre) => typeof genre !== 'string')) {
    throw new TypeError('Invalid movie genres response');
  }

  return [...new Set(genres.map((genre) => genre.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}
