import { isProviderId } from './provider-id';

describe('Kinopoisk IDs', () => {
  it.each(['1', '15000001', String(Number.MAX_SAFE_INTEGER)])('accepts canonical ID %s', (value) => {
    expect(isProviderId(value)).toBe(true);
  });

  it.each(['', '0', '-1', '001', '1.5', '1e3', ' 1 ', 'abc', '9007199254740992', null, 1])('rejects invalid ID %s', (value) => {
    expect(isProviderId(value)).toBe(false);
  });
});
