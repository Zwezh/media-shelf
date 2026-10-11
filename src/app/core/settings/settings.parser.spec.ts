import { parseSettingsDto } from './settings.parser';

describe('Settings format catalog IDs', () => {
  const settings = {
    _id: 'settings',
    genresForFilters: [],
    quality: [{ id: 'quality-1', title: 'FHD', value: '1080p' }],
    extension: [{ id: 'extension-1', value: 'MKV' }],
  };
  it('retains catalog IDs for normalized series and wishlist formats', () => {
    expect(parseSettingsDto(settings)).toMatchObject({ quality: settings.quality, extension: settings.extension });
  });
  it('still accepts value-only legacy options', () => {
    expect(parseSettingsDto({ ...settings, extension: [{ value: 'MKV' }] }).extension).toEqual([{ value: 'MKV' }]);
  });
  it.each([null, '', 123])('rejects a malformed provided catalog ID: %j', (id) => {
    expect(() => parseSettingsDto({ ...settings, extension: [{ id, value: 'MKV' }] })).toThrow(TypeError);
  });
  it('preserves exact catalog values rather than changing the value behind a stable ID', () => {
    const quality = [{ id: 'quality:20313038307020', title: ' FHD ', value: ' 1080p ' }];
    const extension = [{ id: 'extension:204D4B5620', value: ' MKV ' }];
    expect(parseSettingsDto({ ...settings, quality, extension })).toMatchObject({ quality, extension });
  });
});
