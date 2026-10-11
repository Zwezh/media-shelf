import { displayTitle } from './display-title';

describe('displayTitle', () => {
  const media = { title: 'Название', originalTitle: 'English title' };

  it.each(['en', 'pl'])('uses the English name for %s', (language) => {
    expect(displayTitle(media, language)).toBe('English title');
  });

  it('uses the Russian name for Russian', () => {
    expect(displayTitle(media, 'ru')).toBe('Название');
  });

  it('falls back to the other name when the preferred name is absent', () => {
    expect(displayTitle({ ...media, originalTitle: '' }, 'en')).toBe('Название');
    expect(displayTitle({ ...media, title: '' }, 'ru')).toBe('English title');
    expect(displayTitle(null, 'en')).toBe('');
  });
});
