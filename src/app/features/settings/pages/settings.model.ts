export type SettingsFormModel = {
  readonly defaultExtension: string;
  readonly defaultQuality: string;
  readonly newGenre: string;
};

export type SettingsOperation = 'idle' | 'refilling' | 'saving';

export const EMPTY_SETTINGS_FORM_MODEL: SettingsFormModel = {
  defaultExtension: '',
  defaultQuality: '',
  newGenre: '',
};
