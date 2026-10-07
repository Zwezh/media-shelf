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
});
