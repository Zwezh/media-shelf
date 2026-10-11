/** Kinopoisk IDs use canonical positive decimal strings within JS integer precision. */
export function isProviderId(value: unknown): value is string {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}
