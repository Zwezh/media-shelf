import { isIsoDate, toLocalDate } from './date';

describe('calendar dates', () => {
  it.each(['2024-02-29', '2026-10-11', '0001-01-01'])('accepts valid ISO date %s', (date) => {
    expect(isIsoDate(date)).toBe(true);
  });

  it.each(['2026-02-29', '2026-02-30', '2026-13-01', '', '2026-10-11T00:00:00Z'])('rejects invalid date %s', (date) => {
    expect(isIsoDate(date)).toBe(false);
  });

  it('uses the local calendar day across a UTC day boundary', () => {
    const date = new Date('2026-10-10T22:30:00Z');
    vi.spyOn(date, 'getTimezoneOffset').mockReturnValue(-120);
    expect(toLocalDate(date)).toBe('2026-10-11');
  });
});
