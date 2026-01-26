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
              txHash: "0xabc789",
            },
            bondKpiLinkedRate: {
              configId: TEST_CONFIG_IDS.BOND_KPI_LINKED,
              version: 1,
              facetCount: 0,
              txHash: "0xdef123",
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
            txHash: "0xstu901",
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
            txHash: "0xstu901",
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
        expect(getStepName(99, TEST_WORKFLOWS.NEW_BLR)).to.equal("Unknown Step 99");
        expect(getStepName(-1, TEST_WORKFLOWS.NEW_BLR)).to.equal("Unknown Step -1");
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
        expect(getStepName(99, TEST_WORKFLOWS.EXISTING_BLR)).to.equal("Unknown Step 99");
        expect(getStepName(-1, TEST_WORKFLOWS.EXISTING_BLR)).to.equal("Unknown Step -1");
      });
    });
  });

  describe("getTotalSteps", () => {
    it("should return 8 for newBlr workflow", () => {
      expect(getTotalSteps(TEST_WORKFLOWS.NEW_BLR)).to.equal(8);
    });

    it("should return 7 for existingBlr workflow", () => {
      expect(getTotalSteps(TEST_WORKFLOWS.EXISTING_BLR)).to.equal(7);
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
      expect(formatted).to.include("Last Update: 2025-11-08T10:05:00.000Z");
      expect(formatted).to.not.include("Failed:");
    });

    it("should format failed checkpoint with error", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.FAILED, 2, TEST_WORKFLOWS.NEW_BLR, {
        step: 2,
        stepName: "Facets",
        error: "Deployment failed: gas limit exceeded",
        timestamp: "2025-11-08T10:05:00.000Z",
      });

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.FAILED}`);
      expect(formatted).to.include("Failed: Deployment failed: gas limit exceeded");
    });

    it("should format completed checkpoint", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.COMPLETED, 8, TEST_WORKFLOWS.NEW_BLR);

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include(`Status: ${TEST_CHECKPOINT_STATUS.COMPLETED}`);
      expect(formatted).to.include("Step: 9/8 - Factory");
    });

    it("should format existingBlr workflow correctly", () => {
      const checkpoint = createStatusTestCheckpoint(TEST_CHECKPOINT_STATUS.IN_PROGRESS, 1, TEST_WORKFLOWS.EXISTING_BLR);

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Step: 2/7 - Facets");
    });
  });

  describe("formatDuration", () => {
    it("should format seconds only", () => {
      expect(formatDuration(5000)).to.equal("5s");
      expect(formatDuration(30000)).to.equal("30s");
    });

    it("should format minutes and seconds", () => {
      expect(formatDuration(65000)).to.equal("1m 5s");
      expect(formatDuration(125000)).to.equal("2m 5s");
      expect(formatDuration(60000)).to.equal("1m 0s");
    });

    it("should format hours, minutes, and seconds", () => {
      expect(formatDuration(3661000)).to.equal("1h 1m 1s");
      expect(formatDuration(7200000)).to.equal("2h 0m 0s");
      expect(formatDuration(3725000)).to.equal("1h 2m 5s");
    });

    it("should handle zero duration", () => {
      expect(formatDuration(0)).to.equal("0s");
    });
  });

  describe("formatTimestamp", () => {
    it("should format ISO timestamp", () => {
      const formatted = formatTimestamp("2025-11-08T10:30:45.123Z");
      expect(formatted).to.equal("2025-11-08 10:30:45");
    });

    it("should handle different ISO formats", () => {
      expect(formatTimestamp("2025-01-01T00:00:00.000Z")).to.equal("2025-01-01 00:00:00");
      expect(formatTimestamp("2025-12-31T23:59:59.999Z")).to.equal("2025-12-31 23:59:59");
    });
  });
});
