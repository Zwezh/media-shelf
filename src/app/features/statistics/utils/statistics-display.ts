import type { StatisticsSnapshot, QualityBucket } from '../models/statistics-snapshot';
const COLORS = [
  'var(--color-primary)',
  'var(--color-badge-series-text)',
  'var(--color-badge-wish-text)',
  'var(--color-badge-age-text)',
  'var(--color-text-muted)',
];
export type QualitySegment = QualityBucket & { percentage: number; offset: number; color: string };
export function qualitySegments(snapshot: StatisticsSnapshot): QualitySegment[] {
  let offset = 0;
  return snapshot.qualities.map((bucket, index) => {
    const percentage = snapshot.totals.titles ? (bucket.count / snapshot.totals.titles) * 100 : 0;
    const segment = { ...bucket, percentage, offset, color: COLORS[index % COLORS.length] };
    offset += percentage;
    return segment;
  });
}
export function histogramBars(values: readonly { count: number }[]): number[] {
  const max = Math.max(1, ...values.map((value) => value.count));
  return values.map((value) => (value.count / max) * 100);
}
