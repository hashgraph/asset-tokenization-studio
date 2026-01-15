// SPDX-License-Identifier: Apache-2.0

/**
 * CLI validation utilities with user-friendly exit behavior.
 *
 * This is the CLI LAYER - functions call process.exit() with helpful error
 * messages for terminal users. Use these in CLI entry points where you want
 * the script to terminate with a clear error message on invalid input.
 *
 * For programmatic use in workflows/operations that need try/catch error
 * handling, use infrastructure/utils/validation.ts which throws errors.
 *
 * @example
 * ```typescript
 * // CLI pattern: exit on error
 * import { requireValidAddress, parseBooleanEnv } from "./cli/shared";
 *
 * const proxyAddress = requireValidAddress(process.env.PROXY_ADDRESS, "PROXY_ADDRESS");
 * const dryRun = parseBooleanEnv("DRY_RUN", false);
 * ```
 *
 * @module cli/shared/validation
 */

import { error, isValidAddress } from "@scripts/infrastructure";

/**
 * Require and validate an Ethereum address from environment variable.
 * Exits process if missing or invalid.
 *
 * @param value - The address value (may be undefined)
 * @param name - Human-readable name for error messages
 * @returns The validated address
 */
export function requireValidAddress(value: string | undefined, name: string): string {
  if (!value) {
    error(`❌ Missing ${name}`);
    process.exit(1);
  }

  if (!isValidAddress(value)) {
    error(`❌ Invalid ${name}: ${value}`);
    error(`Must be a valid Ethereum address (0x...)`);
    process.exit(1);
  }

  return value;
}

/**
 * Validate an optional Ethereum address (only if provided).
 * Exits process if provided but invalid.
 *
 * @param value - The address value (may be undefined)
 * @param name - Human-readable name for error messages
 * @returns The validated address or undefined
 */
export function validateOptionalAddress(value: string | undefined, name: string): string | undefined {
  if (!value) return undefined;

  if (!isValidAddress(value)) {
    error(`❌ Invalid ${name}: ${value}`);
    error(`Must be a valid Ethereum address (0x...)`);
    process.exit(1);
  }

  return value;
}

/**
 * Parse a comma-separated list of addresses from environment variable.
 * Validates each address if list is non-empty.
 *
 * @param envValue - Raw environment variable value
 * @param name - Human-readable name for error messages
 * @returns Array of validated addresses, or undefined if empty
 */
export function parseOptionalAddressList(envValue: string | undefined, name: string): string[] | undefined {
  if (!envValue) return undefined;

  const addresses = envValue
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0);

  if (addresses.length === 0) return undefined;

  for (const addr of addresses) {
    if (!isValidAddress(addr)) {
      error(`❌ Invalid address in ${name}: ${addr}`);
      error(`All addresses must be valid Ethereum addresses (0x...)`);
      process.exit(1);
    }
  }

  return addresses;
}

/**
 * Require an environment variable to be present.
 * Exits process if missing.
 *
 * @param name - Environment variable name
 * @param description - Human-readable description for error message
 * @returns The environment variable value
 */
export function requireEnvVar(name: string, description?: string): string {
  const value = process.env[name];
  if (!value) {
    error(`❌ Missing ${name} environment variable${description ? ` (${description})` : ""}`);
    process.exit(1);
  }
  return value;
}

/**
 * Parse a boolean environment variable.
 *
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns Boolean value
 */
export function parseBooleanEnv(name: string, defaultValue = false): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

/**
 * Parse an integer environment variable.
 *
 * @param name - Environment variable name
 * @param defaultValue - Default value if not set or invalid
 * @returns Integer value
 */
export function parseIntEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
