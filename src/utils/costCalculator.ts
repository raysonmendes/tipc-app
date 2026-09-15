export const COST_PER_KM = 0.35;

export function calculateTotalKm(odoStart: number, odoEnd: number): number {
  return Math.max(0, odoEnd - odoStart);
}

export function calculateOperationalCost(totalKm: number): number {
  return totalKm * COST_PER_KM;
}

export function formatCurrency(value: number | null | undefined): string {
  return `R$ ${(value ?? 0).toFixed(2).replace(".", ",")}`;
}

export function parseOdometer(value: string): number | null {
  const odometer = Number(value.replace(",", "."));
  return Number.isFinite(odometer) && odometer >= 0 ? odometer : null;
}
