import { isRecord } from './record';

describe('isRecord', () => {
  it.each([null, undefined, [], [1], '', 'text', 0, true, () => ({})])('rejects non-record input %s', (value) => {
    expect(isRecord(value)).toBe(false);
  });

  it('accepts objects including records without a prototype', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ value: null })).toBe(true);
    expect(isRecord(Object.create(null))).toBe(true);
  });
});
