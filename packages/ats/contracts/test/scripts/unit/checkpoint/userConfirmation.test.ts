// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for user confirmation utilities.
 *
 * Tests the non-interactive (CI) mode behavior of confirmation utilities.
 * Interactive mode (TTY) is harder to test and relies on manual testing.
 *
 * @module test/scripts/unit/checkpoint/userConfirmation.test
 */

import { expect } from "chai";
import { confirmFailedCheckpointResume, selectCheckpointToResume } from "@scripts/infrastructure";
import { TEST_ADDRESSES, TEST_NETWORKS, TEST_WORKFLOWS, TEST_CHECKPOINT_STATUS, TEST_TIMESTAMPS } from "@test";
import type { DeploymentCheckpoint } from "@scripts/infrastructure";

/**
 * Create a mock checkpoint for testing.
 */
function createMockCheckpoint(overrides: Partial<DeploymentCheckpoint> = {}): DeploymentCheckpoint {
  return {
    schemaVersion: 2,
    checkpointId: `${TEST_NETWORKS.TESTNET}-${Date.now()}`,
    network: TEST_NETWORKS.TESTNET,
    deployer: TEST_ADDRESSES.VALID_0,
    status: TEST_CHECKPOINT_STATUS.IN_PROGRESS,
    currentStep: 2,
    workflowType: TEST_WORKFLOWS.NEW_BLR,
    startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
    lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE_LATER,
    steps: {},
    options: {},
    ...overrides,
  };
}

describe("user confirmation utilities", () => {
  // Store original isTTY to restore after tests
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    originalIsTTY = process.stdin.isTTY;
    // Force non-interactive mode for tests
    (process.stdin as any).isTTY = false;
  });

  afterEach(() => {
    // Restore original value
    (process.stdin as any).isTTY = originalIsTTY;
  });

  describe("confirmFailedCheckpointResume", () => {
    it("should start fresh by default in non-interactive mode", async () => {
      const checkpoint = createMockCheckpoint({
        status: TEST_CHECKPOINT_STATUS.FAILED,
        failure: {
          step: 2,
          stepName: "Facets",
          error: "Test error",
          timestamp: new Date().toISOString(),
        },
      });

      const result = await confirmFailedCheckpointResume(checkpoint);

      // Default: start fresh (safe for CI)
      expect(result).to.be.false;
    });

    it("should auto-resume in non-interactive mode when AUTO_RESUME=true", async () => {
      const originalAutoResume = process.env.AUTO_RESUME;
      process.env.AUTO_RESUME = "true";

      try {
        const checkpoint = createMockCheckpoint({
          status: TEST_CHECKPOINT_STATUS.FAILED,
          failure: {
            step: 2,
            stepName: "Facets",
            error: "Test error",
            timestamp: new Date().toISOString(),
          },
        });

        const result = await confirmFailedCheckpointResume(checkpoint);

        expect(result).to.be.true;
      } finally {
        if (originalAutoResume === undefined) {
          delete process.env.AUTO_RESUME;
        } else {
          process.env.AUTO_RESUME = originalAutoResume;
        }
      }
    });

    it("should handle checkpoint without failure info", async () => {
      const checkpoint = createMockCheckpoint({
        status: TEST_CHECKPOINT_STATUS.FAILED,
        // No failure field
      });

      const result = await confirmFailedCheckpointResume(checkpoint);

      // Default: start fresh (safe for CI)
      expect(result).to.be.false;
    });
  });

  describe("selectCheckpointToResume", () => {
    it("should return null for empty array", async () => {
      const result = await selectCheckpointToResume([]);

      expect(result).to.be.null;
    });

    it("should return newest checkpoint in non-interactive mode", async () => {
      const olderCheckpoint = createMockCheckpoint({
        checkpointId: `${TEST_NETWORKS.TESTNET}-1000`,
      });
      const newerCheckpoint = createMockCheckpoint({
        checkpointId: `${TEST_NETWORKS.TESTNET}-2000`,
      });

      // Array is pre-sorted (newest first)
      const result = await selectCheckpointToResume([newerCheckpoint, olderCheckpoint]);

      expect(result).to.not.be.null;
      expect(result!.checkpointId).to.equal(newerCheckpoint.checkpointId);
    });

    it("should select single checkpoint", async () => {
      const checkpoint = createMockCheckpoint();

      const result = await selectCheckpointToResume([checkpoint]);

      expect(result).to.not.be.null;
      expect(result!.checkpointId).to.equal(checkpoint.checkpointId);
    });

    it("should handle mixed status checkpoints", async () => {
      const failedCheckpoint = createMockCheckpoint({
        checkpointId: `${TEST_NETWORKS.TESTNET}-3000`,
        status: TEST_CHECKPOINT_STATUS.FAILED,
        failure: {
          step: 2,
          stepName: "Facets",
          error: "Test error",
          timestamp: new Date().toISOString(),
        },
      });
      const inProgressCheckpoint = createMockCheckpoint({
        checkpointId: `${TEST_NETWORKS.TESTNET}-2000`,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS,
      });

      // First in array is returned in non-interactive mode
      const result = await selectCheckpointToResume([failedCheckpoint, inProgressCheckpoint]);

      expect(result).to.not.be.null;
      expect(result!.checkpointId).to.equal(failedCheckpoint.checkpointId);
    });
  });
});
