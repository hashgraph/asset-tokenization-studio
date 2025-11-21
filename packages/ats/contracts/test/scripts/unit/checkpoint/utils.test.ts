// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import {
  checkpointToDeploymentOutput,
  getStepName,
  getTotalSteps,
  formatCheckpointStatus,
  formatDuration,
  formatTimestamp,
} from "../../../../scripts/infrastructure/checkpoint/utils";
import type { DeploymentCheckpoint } from "../../../../scripts/infrastructure/types/checkpoint";

describe("Checkpoint Utilities", () => {
  describe("checkpointToDeploymentOutput", () => {
    it("should convert completed checkpoint to deployment output", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {
          proxyAdmin: {
            address: "0x1111111111111111111111111111111111111111",
            contractId: "0.0.1111",
            txHash: "0xabc123",
            deployedAt: "2025-11-08T10:01:00.000Z",
          },
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x2222222222222222222222222222222222222221",
            proxy: "0x2222222222222222222222222222222222222222",
            contractId: "0.0.2222",
            txHash: "0xdef456",
            deployedAt: "2025-11-08T10:02:00.000Z",
          },
          facets: new Map([
            [
              "AccessControlFacet",
              {
                address: "0x3333333333333333333333333333333333333333",
                contractId: "0.0.3333",
                txHash: "0xghi789",
                gasUsed: "500000",
                deployedAt: "2025-11-08T10:05:00.000Z",
              },
            ],
            [
              "PausableFacet",
              {
                address: "0x4444444444444444444444444444444444444444",
                contractId: "0.0.4444",
                txHash: "0xjkl012",
                gasUsed: "450000",
                deployedAt: "2025-11-08T10:06:00.000Z",
              },
            ],
          ]),
          facetsRegistered: true,
          configurations: {
            equity: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000001",
              version: 1,
              facetCount: 43,
              txHash: "0xmno345",
            },
            bond: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
              version: 1,
              facetCount: 43,
              txHash: "0xpqr678",
            },
            bondFixedRate: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000003",
              version: 1,
              facetCount: 47,
              txHash: "0xabc789",
            },
          },
          factory: {
            address: "0x5555555555555555555555555555555555555555",
            implementation: "0x5555555555555555555555555555555555555554",
            proxy: "0x5555555555555555555555555555555555555555",
            contractId: "0.0.5555",
            txHash: "0xstu901",
            gasUsed: "800000",
            deployedAt: "2025-11-08T10:14:00.000Z",
          },
        },
        options: {},
      };

      const output = checkpointToDeploymentOutput(checkpoint);

      expect(output.network).to.equal("hedera-testnet");
      expect(output.deployer).to.equal("0x1234567890123456789012345678901234567890");
      expect(output.timestamp).to.be.a("string");

      // Infrastructure
      expect(output.infrastructure.proxyAdmin.address).to.equal("0x1111111111111111111111111111111111111111");
      expect(output.infrastructure.proxyAdmin.contractId).to.equal("0.0.1111");

      expect(output.infrastructure.blr.implementation).to.equal("0x2222222222222222222222222222222222222221");
      expect(output.infrastructure.blr.proxy).to.equal("0x2222222222222222222222222222222222222222");
      expect(output.infrastructure.blr.contractId).to.equal("0.0.2222");

      expect(output.infrastructure.factory.implementation).to.equal("0x5555555555555555555555555555555555555554");
      expect(output.infrastructure.factory.proxy).to.equal("0x5555555555555555555555555555555555555555");
      expect(output.infrastructure.factory.contractId).to.equal("0.0.5555");

      // Facets
      expect(output.facets).to.have.lengthOf(2);
      expect(output.facets[0].name).to.equal("AccessControlFacet");
      expect(output.facets[0].address).to.equal("0x3333333333333333333333333333333333333333");
      expect(output.facets[1].name).to.equal("PausableFacet");
      expect(output.facets[1].address).to.equal("0x4444444444444444444444444444444444444444");

      // Configurations
      expect(output.configurations.equity.configId).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      );
      expect(output.configurations.equity.version).to.equal(1);
      expect(output.configurations.equity.facetCount).to.equal(43);

      expect(output.configurations.bond.configId).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000002",
      );
      expect(output.configurations.bond.version).to.equal(1);
      expect(output.configurations.bond.facetCount).to.equal(43);
      expect(output.configurations.bondFixedRate.configId).to.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000003",
      );
      expect(output.configurations.bondFixedRate.version).to.equal(1);
      expect(output.configurations.bondFixedRate.facetCount).to.equal(44);

      // Summary
      expect(output.summary.totalContracts).to.equal(5); // ProxyAdmin + BLR + Factory + 2 facets
      expect(output.summary.totalFacets).to.equal(2);
      expect(output.summary.totalConfigurations).to.equal(3);
      expect(output.summary.success).to.be.true;
      expect(output.summary.deploymentTime).to.be.a("number");
      expect(output.summary.gasUsed).to.equal("1750000"); // 500000 + 450000 + 800000
    });

    it("should throw error if ProxyAdmin is missing", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {},
        options: {},
      };

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing ProxyAdmin deployment");
    });

    it("should throw error if BLR is missing", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {
          proxyAdmin: {
            address: "0x1111111111111111111111111111111111111111",
            txHash: "0xabc123",
            deployedAt: "2025-11-08T10:01:00.000Z",
          },
        },
        options: {},
      };

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing BLR deployment");
    });

    it("should throw error if Factory is missing", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {
          proxyAdmin: {
            address: "0x1111111111111111111111111111111111111111",
            txHash: "0xabc123",
            deployedAt: "2025-11-08T10:01:00.000Z",
          },
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x2222222222222222222222222222222222222221",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: "2025-11-08T10:02:00.000Z",
          },
          facets: new Map(),
          configurations: {
            equity: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000001",
              version: 1,
              facetCount: 0,
              txHash: "0xmno345",
            },
            bond: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
              version: 1,
              facetCount: 0,
              txHash: "0xpqr678",
            },
            bondFixedRate: {
              configId: "0x0000000000000000000000000000000000000000000000000000000000000003",
              version: 1,
              facetCount: 0,
              txHash: "0xabc789",
            },
          },
        },
        options: {},
      };

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing Factory deployment");
    });

    it("should throw error if facets are missing", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {
          proxyAdmin: {
            address: "0x1111111111111111111111111111111111111111",
            txHash: "0xabc123",
            deployedAt: "2025-11-08T10:01:00.000Z",
          },
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x2222222222222222222222222222222222222221",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: "2025-11-08T10:02:00.000Z",
          },
          factory: {
            address: "0x5555555555555555555555555555555555555555",
            implementation: "0x5555555555555555555555555555555555555554",
            proxy: "0x5555555555555555555555555555555555555555",
            txHash: "0xstu901",
            deployedAt: "2025-11-08T10:14:00.000Z",
          },
        },
        options: {},
      };

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing facet deployments");
    });

    it("should throw error if configurations are missing", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 6,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {
          proxyAdmin: {
            address: "0x1111111111111111111111111111111111111111",
            txHash: "0xabc123",
            deployedAt: "2025-11-08T10:01:00.000Z",
          },
          blr: {
            address: "0x2222222222222222222222222222222222222222",
            implementation: "0x2222222222222222222222222222222222222221",
            proxy: "0x2222222222222222222222222222222222222222",
            txHash: "0xdef456",
            deployedAt: "2025-11-08T10:02:00.000Z",
          },
          facets: new Map([
            [
              "AccessControlFacet",
              {
                address: "0x3333333333333333333333333333333333333333",
                txHash: "0xghi789",
                deployedAt: "2025-11-08T10:05:00.000Z",
              },
            ],
          ]),
          factory: {
            address: "0x5555555555555555555555555555555555555555",
            implementation: "0x5555555555555555555555555555555555555554",
            proxy: "0x5555555555555555555555555555555555555555",
            txHash: "0xstu901",
            deployedAt: "2025-11-08T10:14:00.000Z",
          },
        },
        options: {},
      };

      expect(() => checkpointToDeploymentOutput(checkpoint)).to.throw("Checkpoint missing configurations");
    });
  });

  describe("getStepName", () => {
    describe("newBlr workflow", () => {
      it("should return correct step names", () => {
        expect(getStepName(0, "newBlr")).to.equal("ProxyAdmin");
        expect(getStepName(1, "newBlr")).to.equal("BLR");
        expect(getStepName(2, "newBlr")).to.equal("Facets");
        expect(getStepName(3, "newBlr")).to.equal("Register Facets");
        expect(getStepName(4, "newBlr")).to.equal("Equity Configuration");
        expect(getStepName(5, "newBlr")).to.equal("Bond Configuration");
        expect(getStepName(6, "newBlr")).to.equal("Bond Fixed Rate Configuration");
        expect(getStepName(7, "newBlr")).to.equal("Factory");
      });

      it("should handle unknown step numbers", () => {
        expect(getStepName(99, "newBlr")).to.equal("Unknown Step 99");
        expect(getStepName(-1, "newBlr")).to.equal("Unknown Step -1");
      });
    });

    describe("existingBlr workflow", () => {
      it("should return correct step names", () => {
        expect(getStepName(0, "existingBlr")).to.equal("ProxyAdmin (Optional)");
        expect(getStepName(1, "existingBlr")).to.equal("Facets");
        expect(getStepName(2, "existingBlr")).to.equal("Register Facets");
        expect(getStepName(3, "existingBlr")).to.equal("Equity Configuration");
        expect(getStepName(4, "existingBlr")).to.equal("Bond Configuration");
        expect(getStepName(5, "existingBlr")).to.equal("Bond Fixed Rate Configuration");
        expect(getStepName(6, "existingBlr")).to.equal("Factory");
      });

      it("should handle unknown step numbers", () => {
        expect(getStepName(99, "existingBlr")).to.equal("Unknown Step 99");
        expect(getStepName(-1, "existingBlr")).to.equal("Unknown Step -1");
      });
    });
  });

  describe("getTotalSteps", () => {
    it("should return 8 for newBlr workflow", () => {
      expect(getTotalSteps("newBlr")).to.equal(8);
    });

    it("should return 7 for existingBlr workflow", () => {
      expect(getTotalSteps("existingBlr")).to.equal(7);
    });
  });

  describe("formatCheckpointStatus", () => {
    it("should format in-progress checkpoint", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "in-progress",
        currentStep: 2,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:05:00.000Z",
        steps: {},
        options: {},
      };

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Checkpoint: hedera-testnet-1731085200000");
      expect(formatted).to.include("Status: in-progress");
      expect(formatted).to.include("Step: 3/7 - Facets");
      expect(formatted).to.include("Started: 2025-11-08T10:00:00.000Z");
      expect(formatted).to.include("Last Update: 2025-11-08T10:05:00.000Z");
      expect(formatted).to.not.include("Failed:");
    });

    it("should format failed checkpoint with error", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "failed",
        currentStep: 2,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:05:00.000Z",
        steps: {},
        options: {},
        failure: {
          step: 2,
          stepName: "Facets",
          error: "Deployment failed: gas limit exceeded",
          timestamp: "2025-11-08T10:05:00.000Z",
        },
      };

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Status: failed");
      expect(formatted).to.include("Failed: Deployment failed: gas limit exceeded");
    });

    it("should format completed checkpoint", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "completed",
        currentStep: 7,
        workflowType: "newBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:15:00.000Z",
        steps: {},
        options: {},
      };

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Status: completed");
      expect(formatted).to.include("Step: 8/8 - Factory");
    });

    it("should format existingBlr workflow correctly", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "hedera-testnet-1731085200000",
        network: "hedera-testnet",
        deployer: "0x1234567890123456789012345678901234567890",
        status: "in-progress",
        currentStep: 1,
        workflowType: "existingBlr",
        startTime: "2025-11-08T10:00:00.000Z",
        lastUpdate: "2025-11-08T10:05:00.000Z",
        steps: {},
        options: {},
      };

      const formatted = formatCheckpointStatus(checkpoint);

      expect(formatted).to.include("Step: 2/6 - Facets");
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
