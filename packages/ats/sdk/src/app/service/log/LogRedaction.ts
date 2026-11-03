// SPDX-License-Identifier: Apache-2.0

/**
 * Helpers that keep secrets (private keys, API keys, custodial credentials,
 * signatures) and URL paths/queries out of log output while preserving the
 * non-secret context that makes a log line useful.
 */

export const REDACTED = "[REDACTED]";

// Object keys whose values must never be logged.
const SENSITIVE_KEY =
  /(private.?key|secret|password|passphrase|auth(orization)?.?token|api.?key|access.?key|signature|^token$|bearer)/i;

// Object keys that hold URLs; only their origin is logged.
const URL_KEY = /url$/i;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY.test(key);
}

/**
 * Reduces a URL to its origin (scheme + host + port), dropping credentials,
 * path, query and fragment, which is where API keys and tokens usually live.
 */
export function redactUrl(url?: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return REDACTED;
  }
}

/**
 * JSON replacer that masks sensitive keys and reduces URL-valued keys to their origin.
 * Safe to pass to JSON.stringify / fast-safe-stringify.
 */
export function redactReplacer(key: string, value: unknown): unknown {
  if (!key) return value;
  if (isSensitiveKey(key)) {
    return value === undefined || value === null ? value : REDACTED;
  }
  if (URL_KEY.test(key) && typeof value === "string") {
    return redactUrl(value);
  }
  return value;
}

/**
 * Returns a plain, log-safe copy of the given value with sensitive fields masked.
 * Primitives are returned unchanged.
 */
export function redactForLog<T>(value: T): unknown {
  if (value === null || value === undefined || typeof value !== "object") {
    return value;
  }
  const seen = new WeakSet<object>();
  try {
    return JSON.parse(
      JSON.stringify(value, (key: string, val: unknown) => {
        if (typeof val === "bigint") return val.toString();
        if (val !== null && typeof val === "object") {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        return redactReplacer(key, val);
      }),
    );
  } catch {
    return REDACTED;
  }
}
