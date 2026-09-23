import english from '../../../../public/i18n/en.json';
import polish from '../../../../public/i18n/pl.json';
import russian from '../../../../public/i18n/ru.json';

const translationKeys = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === 'object' && entry !== null ? translationKeys(entry, path) : [path];
  });

describe('translation resources', () => {
  it.each([
    ['Russian', russian],
    ['Polish', polish],
  ])('keeps %s keys aligned with English', (_language, translations) => {
    expect(translationKeys(translations).sort()).toEqual(translationKeys(english).sort());
  });
});
