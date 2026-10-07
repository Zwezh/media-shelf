export function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(field);
  return value as Record<string, unknown>;
}

export function booleanValue(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw invalid(field);
  return value;
}

export function nullableNumber(value: unknown, field: string): number | null | undefined {
  if (value === null || value === undefined) return value;
  return numberValue(value, field);
}

export function numberValue(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(field);
  return value;
}

export function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw invalid(field);
  return [...value] as string[];
}

export function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

export function yearValue(value: unknown): number | number[] {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value) && value.length > 0 && value.every((year) => typeof year === 'number' && Number.isFinite(year))) {
    return [...value] as number[];
  }
  throw invalid('year');
}

export function invalid(field: string): TypeError {
  return new TypeError(`Invalid API response field: ${field}`);
}
