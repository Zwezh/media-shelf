import type { SettingsDto } from '@msh-core/settings/settings.dto';
import type { SettingsFormModel } from './settings.model';

export function settingsFormModelsEqual(left: SettingsFormModel, right: SettingsFormModel): boolean {
  return left.defaultExtension === right.defaultExtension && left.defaultQuality === right.defaultQuality;
}

export function genresEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((genre, index) => genre === right[index]);
}

export function sortGenres(genres: readonly string[]): string[] {
  return [...genres].sort((left, right) => left.localeCompare(right));
}

export function toSettingsFormModel(settings: SettingsDto): SettingsFormModel {
  return {
    defaultExtension: settings.extension.find((option) => option.default)?.value ?? '',
    defaultQuality: settings.quality.find((option) => option.default)?.value ?? '',
    newGenre: '',
  };
}
