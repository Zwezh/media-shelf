export type ExtensionSettingOption = {
  readonly id?: string;
  readonly default?: boolean;
  readonly value: string;
};

export type QualitySettingOption = ExtensionSettingOption & {
  readonly title: string;
};

export type SettingsDto = {
  readonly extension: readonly ExtensionSettingOption[];
  readonly genresForFilters: string[];
  readonly id: string;
  readonly quality: readonly QualitySettingOption[];
};
