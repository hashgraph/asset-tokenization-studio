// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for checkpoint converters.
 *
 * Tests conversion functions that transform checkpoint data to operation results.
 * These are pure functions that don't require contract interactions.
 *
 * @module test/scripts/unit/checkpoint/converters.test
 */

import { expect } from "chai";
import {
  isSuccess,
  isFailure,
  toDeploymentResult,
  toDeployBlrResult,
  toDeployFactoryResult,
  toConfigurationData,
  convertCheckpointFacets,
  extractCheckpointResults,
  type DeploymentCheckpoint,
  type DeployedContract,
  type ConfigurationResult,
  type OperationResult,
} from "@scripts/infrastructure";
import {
  TEST_ADDRESSES,
  TEST_TX_HASHES,
  TEST_CONFIG_IDS,
  TEST_WORKFLOWS,
  TEST_NETWORKS,
  TEST_TIMESTAMPS,
  TEST_CHECKPOINT_STATUS,
} from "@test";

describe("Checkpoint Converters", () => {
  // ============================================================================
  // Type Guards
  // ============================================================================

  describe("isSuccess", () => {
    it("should return true for successful result", () => {
      const result: OperationResult<string, never> = {
        success: true,
        data: "test data",
      };

      expect(isSuccess(result)).to.be.true;
    });

    it("should return false for failed result", () => {
      const result: OperationResult<string, "VALIDATION_ERROR"> = {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Validation failed",
      };

      expect(isSuccess(result)).to.be.false;
    });

    it("should narrow type when used in filter", () => {
      const results: OperationResult<number, "ERROR">[] = [
        { success: true, data: 1 },
        { success: false, error: "ERROR", message: "Failed" },
        { success: true, data: 2 },
      ];

      const successful = results.filter(isSuccess);

      expect(successful).to.have.length(2);
      // Type narrowing allows accessing data
      expect(successful[0].data).to.equal(1);
      expect(successful[1].data).to.equal(2);
    });
  });

  describe("isFailure", () => {
    it("should return true for failed result", () => {
      const result: OperationResult<string, "VALIDATION_ERROR"> = {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Validation failed",
      };

      expect(isFailure(result)).to.be.true;
    });

    it("should return false for successful result", () => {
      const result: OperationResult<string, never> = {
        success: true,
        data: "test data",
      };

      expect(isFailure(result)).to.be.false;
    });

    it("should narrow type when used in filter", () => {
      const results: OperationResult<number, "ERROR">[] = [
        { success: true, data: 1 },
        { success: false, error: "ERROR", message: "Failed 1" },
        { success: false, error: "ERROR", message: "Failed 2" },
      ];

      const failures = results.filter(isFailure);

      expect(failures).to.have.length(2);
      // Type narrowing allows accessing error fields
      expect(failures[0].message).to.equal("Failed 1");
      expect(failures[1].message).to.equal("Failed 2");
    });
  });

  // ============================================================================
  // Contract Deployment Converters
  // ============================================================================

  describe("toDeploymentResult", () => {
    it("should convert deployed contract to deployment result", () => {
      const deployed: DeployedContract = {
        address: TEST_ADDRESSES.VALID_0,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        gasUsed: "1000000",
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeploymentResult(deployed);

      expect(result.success).to.be.true;
      expect(result.address).to.equal(TEST_ADDRESSES.VALID_0);
      expect(result.transactionHash).to.equal(TEST_TX_HASHES.SAMPLE_0);
      expect(result.gasUsed).to.equal(1000000);
      expect(result.blockNumber).to.equal(0); // Not persisted
      expect(result.contract).to.exist;
      expect(result.contract!.address).to.equal(TEST_ADDRESSES.VALID_0);
    });

    it("should handle missing gasUsed", () => {
      const deployed: DeployedContract = {
        address: TEST_ADDRESSES.VALID_1,
        txHash: TEST_TX_HASHES.SAMPLE_1,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeploymentResult(deployed);

      expect(result.success).to.be.true;
      expect(result.address).to.equal(TEST_ADDRESSES.VALID_1);
      expect(result.gasUsed).to.be.undefined;
    });

    it("should parse gasUsed string to number", () => {
      const deployed: DeployedContract = {
        address: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_2,
        gasUsed: "5000000",
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeploymentResult(deployed);

      expect(result.gasUsed).to.equal(5000000);
      expect(typeof result.gasUsed).to.equal("number");
    });
  });

  describe("toDeployBlrResult", () => {
    it("should convert BLR checkpoint to deploy result", () => {
      const blrCheckpoint = {
        address: TEST_ADDRESSES.VALID_0, // ProxyAdmin
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeployBlrResult(blrCheckpoint);

      expect(result.success).to.be.true;
      expect(result.blrAddress).to.equal(TEST_ADDRESSES.VALID_2);
      expect(result.implementationAddress).to.equal(TEST_ADDRESSES.VALID_1);
      expect(result.proxyAdminAddress).to.equal(TEST_ADDRESSES.VALID_0);
      expect(result.initialized).to.be.true;
    });

    it("should use provided proxyAdminAddress override", () => {
      const blrCheckpoint = {
        address: TEST_ADDRESSES.VALID_0,
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };
      const overrideAdmin = TEST_ADDRESSES.VALID_3;

      const result = toDeployBlrResult(blrCheckpoint, overrideAdmin);

      expect(result.proxyAdminAddress).to.equal(overrideAdmin);
    });

    it("should construct nested proxyResult correctly", () => {
      const blrCheckpoint = {
        address: TEST_ADDRESSES.VALID_0,
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeployBlrResult(blrCheckpoint);

      expect(result.proxyResult).to.exist;
      expect(result.proxyResult.proxyAddress).to.equal(TEST_ADDRESSES.VALID_2);
      expect(result.proxyResult.implementationAddress).to.equal(TEST_ADDRESSES.VALID_1);
      expect(result.proxyResult.proxyAdminAddress).to.equal(TEST_ADDRESSES.VALID_0);
    });

    it("should handle external BLR flag", () => {
      const blrCheckpoint = {
        address: TEST_ADDRESSES.VALID_0,
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
        isExternal: true,
      };

      const result = toDeployBlrResult(blrCheckpoint);

      // isExternal is preserved in the checkpoint but not in DeployBlrResult
      // The function still produces a valid result
      expect(result.success).to.be.true;
    });
  });

  describe("toDeployFactoryResult", () => {
    it("should convert factory checkpoint to deploy result", () => {
      const factoryCheckpoint = {
        address: TEST_ADDRESSES.VALID_0,
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeployFactoryResult(factoryCheckpoint);

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.equal(TEST_ADDRESSES.VALID_2);
      expect(result.contract).to.exist;
      expect(result.contract!.address).to.equal(TEST_ADDRESSES.VALID_2);
    });

    it("should set configuration fields as undefined", () => {
      const factoryCheckpoint = {
        address: TEST_ADDRESSES.VALID_0,
        implementation: TEST_ADDRESSES.VALID_1,
        proxy: TEST_ADDRESSES.VALID_2,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
      };

      const result = toDeployFactoryResult(factoryCheckpoint);

      expect(result.configurationId).to.be.undefined;
      expect(result.version).to.be.undefined;
      expect(result.receipt).to.be.undefined;
    });
  });

  // ============================================================================
  // Configuration Converters
  // ============================================================================

  describe("toConfigurationData", () => {
    it("should convert configuration checkpoint to operation result", () => {
      const configCheckpoint: ConfigurationResult = {
        configId: TEST_CONFIG_IDS.EQUITY,
        version: 1,
        facetCount: 5,
        txHash: TEST_TX_HASHES.SAMPLE_0,
        gasUsed: "2000000",
      };

      const result = toConfigurationData(configCheckpoint);

      expect(result.success).to.be.true;
      if (!result.success) throw new Error("Expected success");
      expect(result.data.configurationId).to.equal(TEST_CONFIG_IDS.EQUITY);
      expect(result.data.version).to.equal(1);
      expect(result.data.transactionHash).to.equal(TEST_TX_HASHES.SAMPLE_0);
    });

    it("should set facetKeys to empty array", () => {
      const configCheckpoint: ConfigurationResult = {
        configId: TEST_CONFIG_IDS.BOND,
        version: 2,
        facetCount: 3,
        txHash: TEST_TX_HASHES.SAMPLE_1,
      };

      const result = toConfigurationData(configCheckpoint);

      expect(result.success).to.be.true;
      if (!result.success) throw new Error("Expected success");
      expect(result.data.facetKeys).to.deep.equal([]);
    });

    it("should set blockNumber to 0", () => {
      const configCheckpoint: ConfigurationResult = {
        configId: TEST_CONFIG_IDS.EQUITY,
        version: 1,
        facetCount: 5,
        txHash: TEST_TX_HASHES.SAMPLE_0,
      };

      const result = toConfigurationData(configCheckpoint);

      expect(result.success).to.be.true;
      if (!result.success) throw new Error("Expected success");
      expect(result.data.blockNumber).to.equal(0);
    });
  });

  // ============================================================================
  // Map Conversion Helpers
  // ============================================================================

  describe("convertCheckpointFacets", () => {
    it("should convert facet map to deployment results", () => {
      const checkpointFacets = new Map<string, DeployedContract>([
        [
          "AccessControlFacet",
          { address: TEST_ADDRESSES.VALID_0, txHash: TEST_TX_HASHES.SAMPLE_0, deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE },
        ],
        [
          "PauseFacet",
          { address: TEST_ADDRESSES.VALID_1, txHash: TEST_TX_HASHES.SAMPLE_1, deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE },
        ],
      ]);

      const results = convertCheckpointFacets(checkpointFacets);

      expect(results.size).to.equal(2);
      expect(results.get("AccessControlFacet")?.address).to.equal(TEST_ADDRESSES.VALID_0);
      expect(results.get("PauseFacet")?.address).to.equal(TEST_ADDRESSES.VALID_1);
    });

    it("should handle empty map", () => {
      const checkpointFacets = new Map<string, DeployedContract>();

      const results = convertCheckpointFacets(checkpointFacets);

      expect(results.size).to.equal(0);
    });

    it("should preserve all facet names as keys", () => {
      const facetNames = ["Facet1", "Facet2", "Facet3"];
      const checkpointFacets = new Map<string, DeployedContract>(
        facetNames.map((name, i) => [
          name,
          {
            address: TEST_ADDRESSES[`VALID_${i}` as keyof typeof TEST_ADDRESSES] as string,
            txHash: TEST_TX_HASHES[`SAMPLE_${i}` as keyof typeof TEST_TX_HASHES] as string,
            deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
          },
        ]),
      );

      const results = convertCheckpointFacets(checkpointFacets);

      facetNames.forEach((name) => {
        expect(results.has(name)).to.be.true;
      });
    });
  });

  // ============================================================================
  // Checkpoint Recovery Helpers
  // ============================================================================

  describe("extractCheckpointResults", () => {
    it("should extract all results from complete checkpoint", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "test-checkpoint",
        network: TEST_NETWORKS.TESTNET,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        status: TEST_CHECKPOINT_STATUS.COMPLETED as "completed",
        currentStep: 8,
        startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
        lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE_LATER,
        deployer: TEST_ADDRESSES.VALID_0,
        options: {},
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_0,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
          },
          blr: {
            address: TEST_ADDRESSES.VALID_1,
            implementation: TEST_ADDRESSES.VALID_2,
            proxy: TEST_ADDRESSES.VALID_3,
            txHash: TEST_TX_HASHES.SAMPLE_1,
            deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
          },
          facets: new Map([
            [
              "TestFacet",
              {
                address: TEST_ADDRESSES.VALID_4,
                txHash: TEST_TX_HASHES.SAMPLE_2,
                deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
              },
            ],
          ]),
          factory: {
            address: TEST_ADDRESSES.VALID_5,
            implementation: TEST_ADDRESSES.VALID_6,
            proxy: TEST_ADDRESSES.VALID_5,
            txHash: TEST_TX_HASHES.SAMPLE_3,
            deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
          },
          configurations: {
            equity: {
              configId: TEST_CONFIG_IDS.EQUITY,
              version: 1,
              facetCount: 5,
              txHash: TEST_TX_HASHES.SAMPLE_4,
            },
            bond: {
              configId: TEST_CONFIG_IDS.BOND,
              version: 1,
              facetCount: 5,
              txHash: TEST_TX_HASHES.SAMPLE_5,
            },
          },
        },
      };

      const recovered = extractCheckpointResults(checkpoint);

      expect(recovered.proxyAdmin).to.exist;
      expect(recovered.proxyAdmin?.address).to.equal(TEST_ADDRESSES.VALID_0);

      expect(recovered.blr).to.exist;
      expect(recovered.blr?.blrAddress).to.equal(TEST_ADDRESSES.VALID_3);

      expect(recovered.facets).to.exist;
      expect(recovered.facets?.size).to.equal(1);

      expect(recovered.factory).to.exist;
      expect(recovered.factory?.proxyAddress).to.equal(TEST_ADDRESSES.VALID_5);

      expect(recovered.configurations).to.exist;
      expect(recovered.configurations?.equity).to.exist;
      expect(recovered.configurations?.bond).to.exist;
    });

    it("should return undefined for missing steps", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "partial-checkpoint",
        network: TEST_NETWORKS.TESTNET,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS as "in-progress",
        currentStep: 1,
        startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
        lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE,
        deployer: TEST_ADDRESSES.VALID_0,
        options: {},
        steps: {
          proxyAdmin: {
            address: TEST_ADDRESSES.VALID_0,
            txHash: TEST_TX_HASHES.SAMPLE_0,
            deployedAt: TEST_TIMESTAMPS.ISO_SAMPLE,
          },
        },
      };

      const recovered = extractCheckpointResults(checkpoint);

      expect(recovered.proxyAdmin).to.exist;
      expect(recovered.blr).to.be.undefined;
      expect(recovered.facets).to.be.undefined;
      expect(recovered.factory).to.be.undefined;
      expect(recovered.configurations).to.be.undefined;
    });

    it("should handle partial configurations", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "partial-configs",
        network: TEST_NETWORKS.TESTNET,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS as "in-progress",
        currentStep: 5,
        startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
        lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE,
        deployer: TEST_ADDRESSES.VALID_0,
        options: {},
        steps: {
          configurations: {
            equity: {
              configId: TEST_CONFIG_IDS.EQUITY,
              version: 1,
              facetCount: 5,
              txHash: TEST_TX_HASHES.SAMPLE_0,
            },
            // bond not present
          },
        },
      };

      const recovered = extractCheckpointResults(checkpoint);

      expect(recovered.configurations).to.exist;
      expect(recovered.configurations?.equity).to.exist;
      expect(recovered.configurations?.bond).to.be.undefined;
    });

    it("should handle empty steps", () => {
      const checkpoint: DeploymentCheckpoint = {
        checkpointId: "empty-checkpoint",
        network: TEST_NETWORKS.TESTNET,
        workflowType: TEST_WORKFLOWS.NEW_BLR,
        status: TEST_CHECKPOINT_STATUS.IN_PROGRESS as "in-progress",
        currentStep: 0,
        startTime: TEST_TIMESTAMPS.ISO_SAMPLE,
        lastUpdate: TEST_TIMESTAMPS.ISO_SAMPLE,
        deployer: TEST_ADDRESSES.VALID_0,
        options: {},
        steps: {},
      };

      const recovered = extractCheckpointResults(checkpoint);

      expect(recovered.proxyAdmin).to.be.undefined;
      expect(recovered.blr).to.be.undefined;
      expect(recovered.facets).to.be.undefined;
      expect(recovered.factory).to.be.undefined;
      expect(recovered.configurations).to.be.undefined;
    });
  });
});
