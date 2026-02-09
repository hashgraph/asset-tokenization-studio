// SPDX-License-Identifier: Apache-2.0

export function dateToUnixTimestamp(dateString: string): number {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please provide a valid date.");
  }

  return Math.floor(date.getTime() / 1000);
}

/**
 * Generate standardized filename-safe timestamp in ISO format.
 * Format: YYYY-MM-DDTHH-MM-SS-sss
 *
 * Replaces colons and periods from ISO timestamp to create filesystem-compatible
 * timestamp while preserving ISO structure with T separator for better readability
 * and standards compliance. Includes milliseconds for uniqueness.
 *
 * @returns Timestamp string (e.g., "2025-12-17T11-07-26-123")
 *
 * @example
 * ```typescript
 * const timestamp = generateTimestamp();
 * // Returns: "2025-12-17T11-07-26-123"
 * const filename = `deployment-${timestamp}.json`;
 * // Results in: "deployment-2025-12-17T11-07-26-123.json"
 * ```
 */
export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, -1);
}
