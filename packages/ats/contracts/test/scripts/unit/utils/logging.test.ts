// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for logging utilities.
 *
 * Tests logger configuration, log level management, and output formatting.
 * Note: Tests for actual console output would require mocking console methods.
 *
 * @module test/scripts/unit/utils/logging.test
 */

import { expect } from "chai";
import { configureLogger, LogLevel } from "@scripts/infrastructure";
import { TEST_LOGGER_PREFIXES } from "@test";

// Internal functions not exported from barrel - direct import required for unit testing
import { getLoggerConfig, resetLogger } from "../../../../scripts/infrastructure/utils/logging";

describe("Logging Utilities", () => {
  // Restore default logger state before each test (rootHooks sets SILENT globally)
  beforeEach(() => {
    resetLogger();
  });

  // Re-silence logger after each test to prevent log noise between suites
  afterEach(() => {
    configureLogger({ level: LogLevel.SILENT });
  });

  // ============================================================================
  // LogLevel Enum Tests
  // ============================================================================

  describe("LogLevel", () => {
    it("should have correct numeric values in ascending severity order", () => {
      expect(LogLevel.DEBUG).to.equal(0);
      expect(LogLevel.INFO).to.equal(1);
      expect(LogLevel.WARN).to.equal(2);
      expect(LogLevel.ERROR).to.equal(3);
      expect(LogLevel.SILENT).to.equal(4);
    });

    it("should have DEBUG < INFO < WARN < ERROR < SILENT", () => {
      expect(LogLevel.DEBUG).to.be.lessThan(LogLevel.INFO);
      expect(LogLevel.INFO).to.be.lessThan(LogLevel.WARN);
      expect(LogLevel.WARN).to.be.lessThan(LogLevel.ERROR);
      expect(LogLevel.ERROR).to.be.lessThan(LogLevel.SILENT);
    });
  });

  // ============================================================================
  // configureLogger Tests
  // ============================================================================

  describe("configureLogger", () => {
    it("should update log level", () => {
      configureLogger({ level: LogLevel.DEBUG });

      const config = getLoggerConfig();
      expect(config.level).to.equal(LogLevel.DEBUG);
    });

    it("should update colors setting", () => {
      configureLogger({ colors: false });

      const config = getLoggerConfig();
      expect(config.colors).to.be.false;
    });

    it("should update json setting", () => {
      configureLogger({ json: true });

      const config = getLoggerConfig();
      expect(config.json).to.be.true;
    });

    it("should update timestamp setting", () => {
      configureLogger({ timestamp: true });

      const config = getLoggerConfig();
      expect(config.timestamp).to.be.true;
    });

    it("should update prefix setting", () => {
      configureLogger({ prefix: TEST_LOGGER_PREFIXES.MODULE });

      const config = getLoggerConfig();
      expect(config.prefix).to.equal(TEST_LOGGER_PREFIXES.MODULE);
    });

    it("should merge with existing config", () => {
      configureLogger({ level: LogLevel.DEBUG });
      configureLogger({ colors: false });

      const config = getLoggerConfig();
      expect(config.level).to.equal(LogLevel.DEBUG);
      expect(config.colors).to.be.false;
    });

    it("should handle multiple options at once", () => {
      configureLogger({
        level: LogLevel.WARN,
        colors: false,
        json: true,
        timestamp: true,
        prefix: TEST_LOGGER_PREFIXES.DEPLOYMENT,
      });

      const config = getLoggerConfig();
      expect(config.level).to.equal(LogLevel.WARN);
      expect(config.colors).to.be.false;
      expect(config.json).to.be.true;
      expect(config.timestamp).to.be.true;
      expect(config.prefix).to.equal(TEST_LOGGER_PREFIXES.DEPLOYMENT);
    });

    it("should handle empty options object", () => {
      const configBefore = getLoggerConfig();
      configureLogger({});
      const configAfter = getLoggerConfig();

      expect(configAfter).to.deep.equal(configBefore);
    });
  });

  // ============================================================================
  // getLoggerConfig Tests
  // ============================================================================

  describe("getLoggerConfig", () => {
    it("should return default config initially", () => {
      const config = getLoggerConfig();

      expect(config.level).to.equal(LogLevel.INFO);
      expect(config.colors).to.be.true;
      expect(config.json).to.be.false;
      expect(config.timestamp).to.be.false;
      expect(config.prefix).to.be.undefined;
    });

    it("should return a copy of config (not reference)", () => {
      const config1 = getLoggerConfig();
      const config2 = getLoggerConfig();

      expect(config1).to.not.equal(config2); // Different objects
      expect(config1).to.deep.equal(config2); // Same values
    });

    it("should not allow modification of internal config", () => {
      const config = getLoggerConfig();
      config.level = LogLevel.SILENT;

      // Internal config should remain unchanged
      const internalConfig = getLoggerConfig();
      expect(internalConfig.level).to.equal(LogLevel.INFO);
    });
  });

  // ============================================================================
  // resetLogger Tests
  // ============================================================================

  describe("resetLogger", () => {
    it("should reset level to INFO", () => {
      configureLogger({ level: LogLevel.SILENT });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.level).to.equal(LogLevel.INFO);
    });

    it("should reset colors to true", () => {
      configureLogger({ colors: false });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.colors).to.be.true;
    });

    it("should reset json to false", () => {
      configureLogger({ json: true });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.json).to.be.false;
    });

    it("should reset timestamp to false", () => {
      configureLogger({ timestamp: true });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.timestamp).to.be.false;
    });

    it("should reset prefix to undefined", () => {
      configureLogger({ prefix: TEST_LOGGER_PREFIXES.SOME });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.prefix).to.be.undefined;
    });

    it("should reset all settings at once", () => {
      configureLogger({
        level: LogLevel.ERROR,
        colors: false,
        json: true,
        timestamp: true,
        prefix: TEST_LOGGER_PREFIXES.TEST,
      });
      resetLogger();

      const config = getLoggerConfig();
      expect(config.level).to.equal(LogLevel.INFO);
      expect(config.colors).to.be.true;
      expect(config.json).to.be.false;
      expect(config.timestamp).to.be.false;
      expect(config.prefix).to.be.undefined;
    });
  });

  // ============================================================================
  // Log Level Filtering Tests (verify level check logic)
  // ============================================================================

  describe("Log Level Filtering", () => {
    it("should have SILENT level suppress all output", () => {
      configureLogger({ level: LogLevel.SILENT });

      const config = getLoggerConfig();
      // At SILENT level, all other levels should be filtered out
      expect(config.level > LogLevel.DEBUG).to.be.true;
      expect(config.level > LogLevel.INFO).to.be.true;
      expect(config.level > LogLevel.WARN).to.be.true;
      expect(config.level > LogLevel.ERROR).to.be.true;
    });

    it("should have ERROR level suppress lower levels", () => {
      configureLogger({ level: LogLevel.ERROR });

      const config = getLoggerConfig();
      expect(config.level > LogLevel.DEBUG).to.be.true;
      expect(config.level > LogLevel.INFO).to.be.true;
      expect(config.level > LogLevel.WARN).to.be.true;
      expect(config.level > LogLevel.ERROR).to.be.false; // ERROR should pass
    });

    it("should have DEBUG level allow all output", () => {
      configureLogger({ level: LogLevel.DEBUG });

      const config = getLoggerConfig();
      // At DEBUG level, nothing should be filtered
      expect(config.level > LogLevel.DEBUG).to.be.false;
      expect(config.level > LogLevel.INFO).to.be.false;
      expect(config.level > LogLevel.WARN).to.be.false;
      expect(config.level > LogLevel.ERROR).to.be.false;
    });
  });
});
