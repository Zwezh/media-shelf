import { invalid, numberValue, stringValue } from '../../data-access/dto-values';

export function nullableDate(value: unknown, field: string): string | null {
  if (value === null) return null;
  const date = stringValue(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)
    throw invalid(field);
  return date;
}

export function nullableRange(value: unknown, field: string, min: number, max: number, whole = true): number | null {
  if (value === null) return null;
  const result = numberValue(value, field);
  if (result < min || result > max || (whole && !Number.isSafeInteger(result))) throw invalid(field);
  return result;
}

export function integer(value: unknown, field: string, min: number, max: number): number {
  const result = nullableRange(value, field, min, max);
  if (result === null) throw invalid(field);
  return result;
}
