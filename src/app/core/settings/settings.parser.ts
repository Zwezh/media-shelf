import type { ExtensionSettingOption, QualitySettingOption, SettingsDto } from './settings.dto';

export function parseSettingsDto(value: unknown): SettingsDto {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid settings response');
  const record = value as Record<string, unknown>;
  const genres = record['genresForFilters'];
  if (!Array.isArray(genres) || genres.some((genre) => typeof genre !== 'string')) throw invalid('genresForFilters');

  return {
    extension: optionArray(record['extension'], 'extension', parseExtensionOption),
    genresForFilters: [...genres] as string[],
    id: stringValue(record['_id'], '_id'),
    quality: optionArray(record['quality'], 'quality', parseQualityOption),
  };
}

function optionArray<T>(value: unknown, field: string, parseOption: (value: unknown, field: string) => T): T[] {
  if (!Array.isArray(value)) throw invalid(field);
  return value.map((option, index) => parseOption(option, `${field}[${index}]`));
}

function parseExtensionOption(value: unknown, field: string): ExtensionSettingOption {
  const record = optionRecord(value, field);
  return {
    ...optionalDefault(record['default'], `${field}.default`),
    value: nonEmptyStringValue(record['value'], `${field}.value`),
  };
}

function parseQualityOption(value: unknown, field: string): QualitySettingOption {
  const record = optionRecord(value, field);
  return {
    ...optionalDefault(record['default'], `${field}.default`),
    title: nonEmptyStringValue(record['title'], `${field}.title`),
    value: nonEmptyStringValue(record['value'], `${field}.value`),
  };
}

function optionRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(field);
  return value as Record<string, unknown>;
}

function optionalDefault(value: unknown, field: string): { readonly default?: boolean } {
  if (value === undefined) return {};
  if (typeof value !== 'boolean') throw invalid(field);
  return { default: value };
}

function nonEmptyStringValue(value: unknown, field: string): string {
  const result = stringValue(value, field).trim();
  if (!result) throw invalid(field);
  return result;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

function invalid(field: string): TypeError {
  return new TypeError(`Invalid settings response field: ${field}`);
}
