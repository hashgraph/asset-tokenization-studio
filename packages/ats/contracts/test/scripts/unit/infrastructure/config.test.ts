// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `isTestMode()` — the prod/test switch that selects which
 * EvmAccessors variant the compile pipeline emits.
 *
 * @remarks
 * The switch is tiny but load-bearing: a regression that made it case-sensitive,
 * flipped the explicit-wins precedence, or broke the task-name fallback would
 * silently ship test-override machinery into prod (or strip overrides from
 * tests). These cases lock the contract: an explicit env var always wins
 * (case-insensitive); when unset, the `test`/`coverage` tasks turn it on and
 * everything else leaves it off.
 *
 * @module test/scripts/unit/infrastructure/config.test
 */

import { expect } from "chai";
import { isTestMode } from "@scripts/infrastructure";

const ENV_KEY = "ATS_TEST_MODE";

describe("isTestMode", () => {
  let originalEnv: string | undefined;
  let originalArgv: string[];

  before(() => {
    originalEnv = process.env[ENV_KEY];
    originalArgv = process.argv;
  });

  afterEach(() => {
    delete process.env[ENV_KEY];
    process.argv = originalArgv;
  });

  after(() => {
    if (originalEnv === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalEnv;
    }
    process.argv = originalArgv;
  });

  describe("explicit env var wins", () => {
    it('is true when set to "true", regardless of the active task', () => {
      process.env[ENV_KEY] = "true";
      process.argv = ["node", "hardhat", "compile"];
      expect(isTestMode()).to.be.true;
    });

    it("is case-insensitive", () => {
      process.env[ENV_KEY] = "TRUE";
      expect(isTestMode()).to.be.true;
    });

    it('is false for "false" even while the test task is running', () => {
      process.env[ENV_KEY] = "false";
      process.argv = ["node", "hardhat", "test"];
      expect(isTestMode()).to.be.false;
    });

    it("is false for any non-true value", () => {
      process.env[ENV_KEY] = "1";
      process.argv = ["node", "hardhat", "compile"];
      expect(isTestMode()).to.be.false;
    });
  });

  describe("task-name fallback when the env var is unset", () => {
    it("is true for the test task", () => {
      delete process.env[ENV_KEY];
      process.argv = ["node", "hardhat", "test"];
      expect(isTestMode()).to.be.true;
    });

    it("is true for the coverage task", () => {
      delete process.env[ENV_KEY];
      process.argv = ["node", "hardhat", "coverage"];
      expect(isTestMode()).to.be.true;
    });

    it("is false for non-test tasks", () => {
      delete process.env[ENV_KEY];
      process.argv = ["node", "hardhat", "compile", "--network", "local"];
      expect(isTestMode()).to.be.false;
    });
  });
});
