export function dateToUnixTimestamp(dateString: string): number {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please provide a valid date.");
  }

  return Math.floor(date.getTime() / 1000);
}

/**
 * Generate standardized human-readable timestamp.
 * Format: YYYY-MM-DD_HH-MM-SS
 *
 * @returns Timestamp string (e.g., "2025-12-17_11-07-26")
 *
 * @example
 * ```typescript
 * const timestamp = generateTimestamp();
 * // Returns: "2025-12-17_11-07-26"
 * const filename = `deployment-${timestamp}.json`;
 * // Results in: "deployment-2025-12-17_11-07-26.json"
 * ```
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
