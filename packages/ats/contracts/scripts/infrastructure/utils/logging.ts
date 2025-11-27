// SPDX-License-Identifier: Apache-2.0

/**
 * Structured logging utility for ATS deployment system.
 *
 * Provides consistent, colored terminal output with support for different
 * log levels, progress indicators, and JSON output for CI/CD environments.
 *
 * @module core/utils/logging
 */

/**
 * Log levels in ascending order of severity.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * ANSI color codes for terminal output.
 */
const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
  Gray: "\x1b[90m",
};

/**
 * Logger configuration options.
 */
export interface LoggerConfig {
  level: LogLevel;
  colors: boolean;
  json: boolean;
  timestamp: boolean;
  prefix?: string;
}

/**
 * Default logger configuration.
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  colors: true,
  json: false,
  timestamp: false,
  prefix: undefined,
};

/**
 * Global logger configuration.
 */
let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the global logger.
 *
 * @param options - Partial configuration to merge with defaults
 *
 * @example
 * ```typescript
 * configureLogger({ level: LogLevel.DEBUG, colors: false })
 * ```
 */
export function configureLogger(options: Partial<LoggerConfig>): void {
  config = { ...config, ...options };
}

/**
 * Get current logger configuration.
 *
 * @returns Current logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Reset logger to default configuration.
 */
export function resetLogger(): void {
  config = { ...DEFAULT_CONFIG };
}

/**
 * Format a log message with optional color and prefix.
 *
 * @param level - Log level name
 * @param message - Message to log
 * @param color - ANSI color code
 * @returns Formatted message string
 */
function formatMessage(level: string, message: string, color: string): string {
  const parts: string[] = [];

  if (config.timestamp) {
    const timestamp = new Date().toISOString();
    parts.push(config.colors ? `${Colors.Gray}[${timestamp}]${Colors.Reset}` : `[${timestamp}]`);
  }

  if (config.prefix) {
    parts.push(config.colors ? `${Colors.Cyan}[${config.prefix}]${Colors.Reset}` : `[${config.prefix}]`);
  }

  const levelStr = config.colors ? `${color}[${level}]${Colors.Reset}` : `[${level}]`;
  parts.push(levelStr);

  parts.push(message);

  return parts.join(" ");
}

/**
 * Format a log entry as JSON.
 *
 * @param level - Log level name
 * @param message - Message to log
 * @param data - Optional data object
 * @returns JSON string
 */
function formatJson(level: string, message: string, data?: unknown): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (config.prefix) {
    entry.prefix = config.prefix;
  }

  if (data !== undefined) {
    entry.data = data;
  }

  return JSON.stringify(entry);
}

/**
 * Log a debug message.
 *
 * @param message - Message to log
 * @param data - Optional data object (only used in JSON mode)
 *
 * @example
 * ```typescript
 * debug('Contract factory created', { contractName: 'AccessControlFacet' })
 * ```
 */
export function debug(message: string, data?: unknown): void {
  if (config.level > LogLevel.DEBUG) return;

  const output = config.json ? formatJson("DEBUG", message, data) : formatMessage("DEBUG", message, Colors.Gray);

  console.log(output);
}

/**
 * Log an info message.
 *
 * @param message - Message to log
 * @param data - Optional data object (only used in JSON mode)
 *
 * @example
 * ```typescript
 * info('Deploying contract to network', { network: 'testnet' })
 * ```
 */
export function info(message: string, data?: unknown): void {
  if (config.level > LogLevel.INFO) return;

  const output = config.json ? formatJson("INFO", message, data) : formatMessage("INFO", message, Colors.Blue);

  console.log(output);
}

/**
 * Log a warning message.
 *
 * @param message - Message to log
 * @param data - Optional data object (only used in JSON mode)
 *
 * @example
 * ```typescript
 * warn('Gas price is high', { gasPrice: '150 gwei' })
 * ```
 */
export function warn(message: string, data?: unknown): void {
  if (config.level > LogLevel.WARN) return;

  const output = config.json ? formatJson("WARN", message, data) : formatMessage("WARN", message, Colors.Yellow);

  console.warn(output);
}

/**
 * Log an error message.
 *
 * @param message - Message to log
 * @param data - Optional data object (only used in JSON mode)
 *
 * @example
 * ```typescript
 * error('Deployment failed', { error: err.message })
 * ```
 */
export function error(message: string, data?: unknown): void {
  if (config.level > LogLevel.ERROR) return;

  const output = config.json ? formatJson("ERROR", message, data) : formatMessage("ERROR", message, Colors.Red);

  console.error(output);
}

/**
 * Log a success message (always uses INFO level).
 *
 * @param message - Message to log
 * @param data - Optional data object (only used in JSON mode)
 *
 * @example
 * ```typescript
 * success('Contract deployed successfully', { address: '0x123...' })
 * ```
 */
export function success(message: string, data?: unknown): void {
  if (config.level > LogLevel.INFO) return;

  const output = config.json ? formatJson("SUCCESS", message, data) : formatMessage("SUCCESS", message, Colors.Green);

  console.log(output);
}

/**
 * Create a progress indicator for long-running operations.
 *
 * @param message - Initial message
 * @returns Progress object with update and done methods
 *
 * @example
 * ```typescript
 * const progress = createProgress('Deploying contracts')
 * progress.update('Deploying facet 1/5')
 * progress.update('Deploying facet 2/5')
 * progress.done('All contracts deployed')
 * ```
 */
export function createProgress(message: string): {
  update: (msg: string) => void;
  done: (msg: string) => void;
} {
  if (config.json || config.level > LogLevel.INFO) {
    return {
      update: () => {},
      done: (msg: string) => info(msg),
    };
  }

  let currentMessage = message;
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const render = () => {
    if (!config.colors) {
      process.stdout.write(`\r${currentMessage}`);
      return;
    }

    const spinner = spinnerFrames[frameIndex % spinnerFrames.length];
    process.stdout.write(`\r${Colors.Cyan}${spinner}${Colors.Reset} ${currentMessage}`);
    frameIndex++;
  };

  // Start spinner
  if (config.colors) {
    intervalId = setInterval(render, 80);
  } else {
    render();
  }

  return {
    update: (msg: string) => {
      currentMessage = msg;
      if (!intervalId) {
        render();
      }
    },
    done: (msg: string) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      process.stdout.write("\r\x1b[K");
      success(msg);
    },
  };
}

/**
 * Log a section header for better visual organization.
 *
 * @param title - Section title
 *
 * @example
 * ```typescript
 * section('Deploying Core Infrastructure')
 * ```
 */
export function section(title: string): void {
  if (config.level > LogLevel.INFO) return;

  if (config.json) {
    info(`=== ${title} ===`);
    return;
  }

  const line = "=".repeat(Math.min(title.length + 4, 80));
  const formatted = config.colors
    ? `${Colors.Bright}${Colors.Cyan}${line}\n  ${title}\n${line}${Colors.Reset}`
    : `${line}\n  ${title}\n${line}`;

  console.log(`\n${formatted}\n`);
}

/**
 * Log a table of data.
 *
 * @param headers - Column headers
 * @param rows - Data rows
 *
 * @example
 * ```typescript
 * table(
 *   ['Contract', 'Address', 'Gas Used'],
 *   [
 *     ['AccessControlFacet', '0x123...', '123,456'],
 *     ['KycFacet', '0x456...', '234,567']
 *   ]
 * )
 * ```
 */
export function table(headers: string[], rows: string[][]): void {
  if (config.level > LogLevel.INFO) return;

  if (config.json) {
    const data = rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
    info("Table data", data);
    return;
  }

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const columnValues = [h, ...rows.map((r) => r[i] || "")];
    return Math.max(...columnValues.map((v) => v.length));
  });

  // Format header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(" | ");
  const separator = widths.map((w) => "-".repeat(w)).join("-+-");

  console.log(config.colors ? `${Colors.Bright}${headerRow}${Colors.Reset}` : headerRow);
  console.log(separator);

  // Format rows
  rows.forEach((row) => {
    const formattedRow = row.map((cell, i) => (cell || "").padEnd(widths[i])).join(" | ");
    console.log(formattedRow);
  });

  console.log();
}
