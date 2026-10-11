export const PRODUCTION_STATUSES = ['unknown', 'in_production', 'finished'] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];
