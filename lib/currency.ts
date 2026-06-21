/**
 * Monetary conversion utilities.
 *
 * All financial values in the database are stored as integers in Poisha
 * (1 BDT = 100 Poisha) to eliminate floating-point drift in accounting
 * calculations. These helpers are the only sanctioned conversion points.
 */

/** Convert a BDT (Taka) amount to its integer Poisha representation. */
export function toPoisha(taka: number): number {
  return Math.round(taka * 100);
}

/** Convert a Poisha integer back to a BDT (Taka) value for display. */
export function toTaka(poisha: number): number {
  return poisha / 100;
}

/** Format a Poisha integer as a BDT currency string, e.g. ৳1,35,000 */
export function formatTaka(poisha: number): string {
  const taka = (poisha || 0) / 100;
  return "৳" + taka.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
