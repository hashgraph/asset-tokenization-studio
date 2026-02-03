// SPDX-License-Identifier: Apache-2.0

/**
 * Lightweight standalone logging for registry generation.
 *
 * CRITICAL: No external dependencies to keep startup fast.
 *
 * @module registry-generator/utils/logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Cyan: "\x1b[36m",
  Gray: "\x1b[90m",
};

interface LoggerConfig {
  level: LogLevel;
  colors: boolean;
}

let config: LoggerConfig = {
  level: LogLevel.INFO,
  colors: true,
};

export function configureLogger(options: Partial<LoggerConfig>): void {
  config = { ...config, ...options };
}

export function debug(msg: string): void {
  if (config.level > LogLevel.DEBUG) return;
  const output = config.colors ? `${Colors.Gray}[DEBUG]${Colors.Reset} ${msg}` : `[DEBUG] ${msg}`;
  console.log(output);
}

export function info(msg: string): void {
  if (config.level > LogLevel.INFO) return;
  const output = config.colors ? `${Colors.Blue}[INFO]${Colors.Reset} ${msg}` : `[INFO] ${msg}`;
  console.log(output);
}

export function success(msg: string): void {
  if (config.level > LogLevel.INFO) return;
  const output = config.colors ? `${Colors.Green}[SUCCESS]${Colors.Reset} ${msg}` : `[SUCCESS] ${msg}`;
  console.log(output);
}

export function warn(msg: string): void {
  if (config.level > LogLevel.WARN) return;
  const output = config.colors ? `${Colors.Yellow}[WARN]${Colors.Reset} ${msg}` : `[WARN] ${msg}`;
  console.warn(output);
}

export function error(msg: string): void {
  if (config.level > LogLevel.ERROR) return;
  const output = config.colors ? `${Colors.Red}[ERROR]${Colors.Reset} ${msg}` : `[ERROR] ${msg}`;
  console.error(output);
}

export function section(title: string): void {
  if (config.level > LogLevel.INFO) return;
  const line = "=".repeat(Math.min(title.length + 4, 80));
  const formatted = config.colors
    ? `${Colors.Bright}${Colors.Cyan}${line}\n  ${title}\n${line}${Colors.Reset}`
    : `${line}\n  ${title}\n${line}`;
  console.log(`\n${formatted}\n`);
}

export function table(headers: string[], rows: string[][]): void {
  if (config.level > LogLevel.INFO) return;

  const widths = headers.map((h, i) => {
    const columnValues = [h, ...rows.map((r) => r[i] || "")];
    return Math.max(...columnValues.map((v) => v.length));
  });

  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(" | ");
  const separator = widths.map((w) => "-".repeat(w)).join("-+-");

  console.log(config.colors ? `${Colors.Bright}${headerRow}${Colors.Reset}` : headerRow);
  console.log(separator);

  rows.forEach((row) => {
    const formattedRow = row.map((cell, i) => (cell || "").padEnd(widths[i])).join(" | ");
    console.log(formattedRow);
  });

  console.log();
}
