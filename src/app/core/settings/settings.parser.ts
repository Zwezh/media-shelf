import type { SettingsDto } from './settings.dto';

export function parseSettingsDto(value: unknown): SettingsDto {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid settings response');
  const record = value as Record<string, unknown>;
  const genres = record['genresForFilters'];
  if (!Array.isArray(genres) || genres.some((genre) => typeof genre !== 'string')) throw invalid('genresForFilters');

  return {
    extension: stringValue(record['extension'], 'extension'),
    genresForFilters: [...genres] as string[],
    id: stringValue(record['_id'], '_id'),
    quality: stringValue(record['quality'], 'quality'),
  };
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

function invalid(field: string): TypeError {
  return new TypeError(`Invalid settings response field: ${field}`);
}
