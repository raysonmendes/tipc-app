export const COST_PER_KM = 0.35;

export function calculateTotalKm(odoStart: number, odoEnd: number): number {
  const rawTotal = odoEnd - odoStart;

  // Evita valores negativos antes de arredondar
  const safeTotal = Math.max(0, rawTotal);

  // .toFixed(3) fixa a precisão e parseFloat remove zeros desnecessários no final
  return parseFloat(safeTotal.toFixed(3));
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
