// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for checkpoint utility functions.
 *
 * Tests checkpoint-to-output conversion, step name resolution,
 * status formatting, and time formatting utilities.
 *
 * @module test/scripts/unit/checkpoint/utils.test
 */

import { expect } from "chai";
import {
  checkpointToDeploymentOutput,
  getStepName,
  getTotalSteps,
  formatCheckpointStatus,
  formatDuration,
  formatTimestamp,
} from "@scripts/infrastructure";
import {
  TEST_ADDRESSES,
  TEST_NETWORKS,
  TEST_WORKFLOWS,
  TEST_CHECKPOINT_STATUS,
  TEST_TX_HASHES,
  TEST_CONFIG_IDS,
  TEST_CONTRACT_IDS,
  TEST_TIMESTAMPS,
  TEST_STEPS_NEW_BLR,
  TEST_STEPS_EXISTING_BLR,
  TEST_DURATIONS_MS,
  TEST_DURATION_OUTPUTS,
  TEST_FORMATTED_TIMESTAMPS,
  createCompletedTestCheckpoint,
  createMinimalTestCheckpoint,
  createStatusTestCheckpoint,
} from "@test";

describe("Checkpoint Utilities", () => {
  describe("checkpointToDeploymentOutput", () => {
    it("should convert completed checkpoint to deployment output", () => {
      const checkpoint = createCompletedTestCheckpoint();

      const output = checkpointToDeploymentOutput(checkpoint);

      expect(output.network).to.equal(TEST_NETWORKS.TESTNET);
      expect(output.deployer).to.equal(TEST_ADDRESSES.VALID_0);
      expect(output.timestamp).to.be.a("string");

      // Infrastructure - ProxyAdmin
      expect(output.infrastructure.proxyAdmin.address).to.equal(TEST_ADDRESSES.VALID_2);
      expect(output.infrastructure.proxyAdmin.contractId).to.equal(TEST_CONTRACT_IDS.SAMPLE_0);

      // Infrastructure - BLR
      expect(output.infrastructure.blr.proxy).to.equal(TEST_ADDRESSES.VALID_3);
      expect(output.infrastructure.blr.proxyContractId).to.equal(TEST_CONTRACT_IDS.SAMPLE_2);

      // Facets
      expect(output.facets).to.have.lengthOf(2);
      expect(output.facets[0].name).to.equal("AccessControlFacet");
      expect(output.facets[0].address).to.equal(TEST_ADDRESSES.VALID_4);
      expect(output.facets[1].name).to.equal("PausableFacet");
      expect(output.facets[1].address).to.equal(TEST_ADDRESSES.VALID_5);

      // Configurations
      expect(output.configurations.equity.configId).to.equal(TEST_CONFIG_IDS.EQUITY);
      expect(output.configurations.equity.version).to.equal(1);
      expect(output.configurations.equity.facetCount).to.equal(43);
      expect(output.configurations.bond.configId).to.equal(TEST_CONFIG_IDS.BOND);
      expect(output.configurations.bond.version).to.equal(1);
      expect(output.configurations.bond.facetCount).to.equal(43);
      expect(output.configurations.bondFixedRate.configId).to.equal(TEST_CONFIG_IDS.BOND_FIXED_RATE);
      expect(output.configurations.bondFixedRate.version).to.equal(1);
      expect(output.configurations.bondFixedRate.facetCount).to.equal(47);

      // Summary
      expect(output.summary.totalContracts).to.equal(5); // ProxyAdmin + BLR + Factory + 2 facets
      expect(output.summary.totalFacets).to.equal(2);
      expect(output.summary.totalConfigurations).to.equal(3);
      expect(output.summary.success).to.be.true;
      expect(output.summary.deploymentTime).to.be.a("number");
      expect(output.summary.gasUsed).to.equal("1750000"); // 500000 + 450000 + 800000
    });

    it("should throw error if ProxyAdmin is missing", () => {
      const checkpoint = createMinimalTestCheckpoint();

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing ProxyAdmin deployment");
    });

    it("should throw error if BLR is missing", () => {
      const checkpoint = createMinimalTestCheckpoint({
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_2,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: new Date().toISOString(),
          },
        },
      });

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing BLR deployment");
    });

    it("should throw error if Factory is missing", () => {
      const checkpoint = createMinimalTestCheckpoint({
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_2,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: new Date().toISOString(),
          },
          blr: {
            address: TEST_ADDRESSES.VALID_3,
            implementation: TEST_ADDRESSES.VALID_3,
            proxy: TEST_ADDRESSES.VALID_3,
            txHash: TEST_TX_HASHES.SAMPLE_1,
            deployedAt: new Date().toISOString(),
          },
          facets: new Map(),
          configurations: {
            equity: {
              configId: TEST_CONFIG_IDS.EQUITY,
              version: 1,
              facetCount: 0,
              txHash: TEST_TX_HASHES.SAMPLE_4,
            },
            bond: {
              configId: TEST_CONFIG_IDS.BOND,
              version: 1,
              facetCount: 0,
              txHash: TEST_TX_HASHES.SAMPLE_5,
            },
            bondFixedRate: {
              configId: TEST_CONFIG_IDS.BOND_FIXED_RATE,
              version: 1,
              facetCount: 0,
              txHash: TEST_TX_HASHES.SAMPLE_6,
            },
            bondKpiLinkedRate: {
              configId: TEST_CONFIG_IDS.BOND_KPI_LINKED,
              version: 1,
              facetCount: 0,
              txHash: TEST_TX_HASHES.SAMPLE_7,
            },
          },
        },
      });

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing Factory deployment");
    });

    it("should throw error if facets are missing", () => {
      const checkpoint = createMinimalTestCheckpoint({
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_2,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: new Date().toISOString(),
          },
          blr: {
            address: TEST_ADDRESSES.VALID_3,
            implementation: TEST_ADDRESSES.VALID_3,
            proxy: TEST_ADDRESSES.VALID_3,
            txHash: TEST_TX_HASHES.SAMPLE_1,
            deployedAt: new Date().toISOString(),
          },
          factory: {
            address: TEST_ADDRESSES.VALID_6,
            implementation: TEST_ADDRESSES.VALID_6,
            proxy: TEST_ADDRESSES.VALID_6,
            txHash: TEST_TX_HASHES.SAMPLE_8,
            deployedAt: new Date().toISOString(),
          },
        },
      });

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing facet deployments");
    });

    it("should throw error if configurations are missing", () => {
      const checkpoint = createMinimalTestCheckpoint({
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_2,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: new Date().toISOString(),
          },
          blr: {
            address: TEST_ADDRESSES.VALID_3,
            implementation: TEST_ADDRESSES.VALID_3,
            proxy: TEST_ADDRESSES.VALID_3,
            txHash: TEST_TX_HASHES.SAMPLE_1,
            deployedAt: new Date().toISOString(),
          },
          facets: new Map([
            [
              "AccessControlFacet",
              {
                address: TEST_ADDRESSES.VALID_4,
                txHash: TEST_TX_HASHES.SAMPLE_2,
                deployedAt: new Date().toISOString(),
              },
            ],
          ]),
          factory: {
            address: TEST_ADDRESSES.VALID_6,
            implementation: TEST_ADDRESSES.VALID_6,
            proxy: TEST_ADDRESSES.VALID_6,
            txHash: TEST_TX_HASHES.SAMPLE_8,
            deployedAt: new Date().toISOString(),
          },
        },
      });

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing configurations");
    });
  });

  describe("getStepName", () => {
    describe("newBlr workflow", () => {
      it("should return correct step names", () => {
        expect(getStepName(TEST_STEPS_NEW_BLR.PROXY_ADMIN, TEST_WORKFLOWS.NEW_BLR)).to.equal("ProxyAdmin");
        expect(getStepName(TEST_STEPS_NEW_BLR.BLR, TEST_WORKFLOWS.NEW_BLR)).to.equal("BLR");
        expect(getStepName(TEST_STEPS_NEW_BLR.FACETS, TEST_WORKFLOWS.NEW_BLR)).to.equal("Facets");
        expect(getStepName(TEST_STEPS_NEW_BLR.REGISTER_FACETS, TEST_WORKFLOWS.NEW_BLR)).to.equal("Register Facets");
        expect(getStepName(TEST_STEPS_NEW_BLR.EQUITY_CONFIG, TEST_WORKFLOWS.NEW_BLR)).to.equal("Equity Configuration");
        expect(getStepName(TEST_STEPS_NEW_BLR.BOND_CONFIG, TEST_WORKFLOWS.NEW_BLR)).to.equal("Bond Configuration");
        expect(getStepName(TEST_STEPS_NEW_BLR.BOND_FIXED_RATE_CONFIG, TEST_WORKFLOWS.NEW_BLR)).to.equal(
          "Bond Fixed Rate Configuration",
        );
        expect(getStepName(TEST_STEPS_NEW_BLR.BOND_KPI_LINKED_CONFIG, TEST_WORKFLOWS.NEW_BLR)).to.equal(
          "Bond KpiLinked Rate Configuration",
        );
        expect(getStepName(TEST_STEPS_NEW_BLR.FACTORY, TEST_WORKFLOWS.NEW_BLR)).to.equal("Factory");
      });

      it("should handle unknown step numbers", () => {
        const unknownStepHigh = 99;
        const unknownStepNegative = -1;
        expect(getStepName(unknownStepHigh, TEST_WORKFLOWS.NEW_BLR)).to.equal(`Unknown Step ${unknownStepHigh}`);
        expect(getStepName(unknownStepNegative, TEST_WORKFLOWS.NEW_BLR)).to.equal(
          `Unknown Step ${unknownStepNegative}`,
        );
      });
    });

    describe("existingBlr workflow", () => {
      it("should return correct step names", () => {
        expect(getStepName(TEST_STEPS_EXISTING_BLR.PROXY_ADMIN_OPTIONAL, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "ProxyAdmin (Optional)",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.FACETS, TEST_WORKFLOWS.EXISTING_BLR)).to.equal("Facets");
        expect(getStepName(TEST_STEPS_EXISTING_BLR.REGISTER_FACETS, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "Register Facets",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.EQUITY_CONFIG, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "Equity Configuration",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.BOND_CONFIG, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "Bond Configuration",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.BOND_FIXED_RATE_CONFIG, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "Bond Fixed Rate Configuration",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.BOND_KPI_LINKED_CONFIG, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          "Bond KpiLinked Rate Configuration",
        );
        expect(getStepName(TEST_STEPS_EXISTING_BLR.FACTORY, TEST_WORKFLOWS.EXISTING_BLR)).to.equal("Factory");
      });

      it("should handle unknown step numbers", () => {
        const unknownStepHigh = 99;
        const unknownStepNegative = -1;
        expect(getStepName(unknownStepHigh, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(`Unknown Step ${unknownStepHigh}`);
        expect(getStepName(unknownStepNegative, TEST_WORKFLOWS.EXISTING_BLR)).to.equal(
          `Unknown Step ${unknownStepNegative}`,
        );
      });
    });

    describe("unknown workflow", () => {
      it("should handle unknown workflow type by returning a step name", () => {
        const unknownWorkflow = "unknownWorkflow" as typeof TEST_WORKFLOWS.NEW_BLR;
        const result = getStepName(0, unknownWorkflow);
        // Implementation may fall through to a default or return unknown
        expect(result).to.be.a("string");
        expect(result.length).to.be.greaterThan(0);
      });
    });
  });

  describe("getTotalSteps", () => {
    const expectedNewBlrSteps = 8;
    const expectedExistingBlrSteps = 7;

    it("should return 8 for newBlr workflow", () => {
      expect(getTotalSteps(TEST_WORKFLOWS.NEW_BLR)).to.equal(expectedNewBlrSteps);
    });

    it("should return 7 for existingBlr workflow", () => {
      expect(getTotalSteps(TEST_WORKFLOWS.EXISTING_BLR)).to.equal(expectedExistingBlrSteps);
    });

    it("should handle unknown workflow type", () => {
      const unknownWorkflow = "unknownWorkflow" as typeof TEST_WORKFLOWS.NEW_BLR;
      const result = getTotalSteps(unknownWorkflow);
      // Should return a number (implementation-dependent default)
      expect(result).to.be.a("number");
    });
  });

  describe("formatCheckpointStatus", () => {
    it("should format in-progress checkpoint", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.IN_PROGRESS, 2, TEST_WORKFLOWS.NEW_BLR);

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Checkpoint: ${TEST_NETWORKS.TESTNET}-1731085200000`);
      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.IN_PROGRESS}`);
      expect(formatted).to.include("Step: 3/8 - Facets");
      expect(formatted).to.include(`Started: ${TEST_TIMESTAMPS.ISO_SAMPLE}`);
      expect(formatted).to.include(`Last Update: ${TEST_TIMESTAMPS.ISO_SAMPLE_5MIN_LATER}`);
      expect(formatted).to.not.include("Failed:");
    });

    it("should format failed checkpoint with error", () => {
      const errorMessage = "Deployment failed: gas limit exceeded";
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.FAILED, 2, TEST_WORKFLOWS.NEW_BLR, {
        step: 2,
        stepName: "Facets",
        error: errorMessage,
        timestamp: TEST_TIMESTAMPS.ISO_SAMPLE_5MIN_LATER,
      });

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.FAILED}`);
      expect(formatted).to.include(`Failed: ${errorMessage}`);
    });

    it("should format completed checkpoint", () => {
      const completedStep = 8;
      const checkpoint = createStatusTestCheckpoint(
        TEST_CHECKPOINT_STATUS.COMPLETED,
        completedStep,
        TEST_WORKFLOWS.NEW_BLR,
      );

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.COMPLETED}`);
      expect(formatted).to.include("Step: 9/8 - Factory");
    });

    it("should format existingBlr workflow correctly", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.IN_PROGRESS, 1, TEST_WORKFLOWS.EXISTING_BLR);

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Step: 2/7 - Facets");
    });

    it("should handle checkpoint without failure info", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.FAILED, 2, TEST_WORKFLOWS.NEW_BLR);
      // No failure info passed - simulates a checkpoint that failed but failure wasn't recorded

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.FAILED}`);
      // Should not include Failed: line since no failure info was provided
      expect(formatted).to.not.include("Failed:");
    });
  });

  describe("formatDuration", () => {
    it("should format seconds only", () => {
      expect(formatDuration(TEST_DURATIONS_MS.FIVE_SECONDS)).to.equal(TEST_DURATION_OUTPUTS.FIVE_SECONDS);
      expect(formatDuration(TEST_DURATIONS_MS.THIRTY_SECONDS)).to.equal(TEST_DURATION_OUTPUTS.THIRTY_SECONDS);
    });

    it("should format minutes and seconds", () => {
      expect(formatDuration(TEST_DURATIONS_MS.ONE_MINUTE_FIVE_SECONDS)).to.equal(
        TEST_DURATION_OUTPUTS.ONE_MINUTE_FIVE_SECONDS,
      );
      expect(formatDuration(TEST_DURATIONS_MS.TWO_MINUTES_FIVE_SECONDS)).to.equal(
        TEST_DURATION_OUTPUTS.TWO_MINUTES_FIVE_SECONDS,
      );
      expect(formatDuration(TEST_DURATIONS_MS.ONE_MINUTE)).to.equal(TEST_DURATION_OUTPUTS.ONE_MINUTE);
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatDuration(TEST_DURATIONS_MS.ONE_HOUR_ONE_MIN_ONE_SEC)).to.equal(
        TEST_DURATION_OUTPUTS.ONE_HOUR_ONE_MIN_ONE_SEC,
      );
      expect(formatDuration(TEST_DURATIONS_MS.TWO_HOURS)).to.equal(TEST_DURATION_OUTPUTS.TWO_HOURS);
      expect(formatDuration(TEST_DURATIONS_MS.ONE_HOUR_TWO_MIN_FIVE_SEC)).to.equal(
        TEST_DURATION_OUTPUTS.ONE_HOUR_TWO_MIN_FIVE_SEC,
      );
    });

    it("should handle zero duration", () => {
      expect(formatDuration(TEST_DURATIONS_MS.ZERO)).to.equal(TEST_DURATION_OUTPUTS.ZERO);
    });
  });

  describe("formatTimestamp", () => {
    it("should format ISO timestamp", () => {
      const formatted = formatTimestamp(TEST_TIMESTAMPS.ISO_WITH_MILLIS);
      expect(formatted).to.equal(TEST_FORMATTED_TIMESTAMPS.WITH_MILLIS);
    });

    it("should handle different ISO formats", () => {
      expect(formatTimestamp(TEST_TIMESTAMPS.YEAR_START)).to.equal(TEST_FORMATTED_TIMESTAMPS.YEAR_START);
      expect(formatTimestamp(TEST_TIMESTAMPS.YEAR_END)).to.equal(TEST_FORMATTED_TIMESTAMPS.YEAR_END);
    });

    it("should format standard ISO sample", () => {
      const formatted = formatTimestamp(TEST_TIMESTAMPS.ISO_SAMPLE);
      expect(formatted).to.equal(TEST_FORMATTED_TIMESTAMPS.ISO_SAMPLE);
    });
  });
});
