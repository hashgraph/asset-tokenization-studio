// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for deployment file utilities.
 *
 * Tests loading, listing, finding, and saving deployment output files.
 * Uses temporary test deployments to avoid dependency on actual deployment files.
 *
 * @module test/scripts/unit/utils/deploymentFiles.test
 */

import { expect } from "chai";
import sinon from "sinon";
import { promises as fs } from "fs";
import { join } from "path";
import {
  loadDeployment,
  loadDeploymentByWorkflow,
  findLatestDeployment,
  listDeploymentsByWorkflow,
  saveDeploymentOutput,
  generateTimestamp,
  generateDeploymentFilename,
  getDeploymentsDir,
  getNetworkDeploymentDir,
  type DeploymentOutputType,
} from "@scripts/infrastructure";
import { TEST_ADDRESSES, TEST_CONFIG_IDS, TEST_WORKFLOWS, TEST_TIMESTAMPS, removeTestDeployments } from "@test";

describe("Deployment File Utilities", () => {
  const TEST_DEPLOYMENTS_DIR = getDeploymentsDir();
  const TEST_NETWORK = "test/test-network";
  const TEST_WORKFLOW = TEST_WORKFLOWS.NEW_BLR;

  // Sample deployment data
  const createSampleDeployment = (timestamp: string): DeploymentOutputType => ({
    network: TEST_NETWORK,
    timestamp,
    deployer: TEST_ADDRESSES.VALID_0,
    infrastructure: {
      proxyAdmin: {
        address: "0xProxyAdmin123456789012345678901234567890",
      },
      blr: {
        implementation: "0xBLRImpl1234567890123456789012345678901",
        proxy: "0xBLRProxy123456789012345678901234567890",
      },
      factory: {
        implementation: "0xFactoryImpl123456789012345678901234567",
        proxy: "0xFactoryProxy123456789012345678901234567",
      },
    },
    facets: [
      {
        name: "AccessControlFacet",
        address: TEST_ADDRESSES.VALID_2,
        key: TEST_CONFIG_IDS.EQUITY,
      },
    ],
    configurations: {
      equity: {
        configId: TEST_CONFIG_IDS.EQUITY,
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: TEST_CONFIG_IDS.EQUITY,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
      bond: {
        configId: TEST_CONFIG_IDS.BOND,
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: TEST_CONFIG_IDS.BOND,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
      bondFixedRate: {
        configId: TEST_CONFIG_IDS.BOND_FIXED_RATE,
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: TEST_CONFIG_IDS.BOND_FIXED_RATE,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
      bondKpiLinkedRate: {
        configId: TEST_CONFIG_IDS.BOND_KPI_LINKED,
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: TEST_CONFIG_IDS.BOND_KPI_LINKED,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
      bondSustainabilityPerformanceTargetRate: {
        configId: TEST_CONFIG_IDS.BOND_SPT,
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: TEST_CONFIG_IDS.BOND_SPT,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
    },
    summary: {
      totalContracts: 48,
      totalFacets: 1,
      totalConfigurations: 5,
      deploymentTime: 5000,
      gasUsed: "0",
      success: true,
    },
    helpers: {
      getEquityFacets: () => [],
      getBondFacets: () => [],
      getBondFixedRateFacets: () => [],
      getBondKpiLinkedRateFacets: () => [],
      getBondSustainabilityPerformanceTargetRateFacets: () => [],
    },
  });

  // Helper to create test deployment file
  async function createTestDeployment(timestamp: string): Promise<void> {
    const deployment = createSampleDeployment(timestamp);
    const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
    const filename = `${TEST_WORKFLOW}-${timestamp}.json`;
    const filepath = join(networkDir, filename);

    // Ensure network directory exists
    await fs.mkdir(networkDir, { recursive: true }).catch(() => {});
    await fs.writeFile(filepath, JSON.stringify(deployment, null, 2));
  }

  // Helper to cleanup test deployment file
  async function cleanupTestDeployment(timestamp: string): Promise<void> {
    const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
    const filename = `${TEST_WORKFLOW}-${timestamp}.json`;
    const filepath = join(networkDir, filename);
    await fs.unlink(filepath).catch(() => {});
  }

  // Cleanup all test deployment files
  async function cleanupAllTestDeployments(): Promise<void> {
    const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
    try {
      const files = await fs.readdir(networkDir);
      const testFiles = files.filter((f) => f.startsWith(`${TEST_WORKFLOW}-`));
      await Promise.all(testFiles.map((f) => fs.unlink(join(networkDir, f))));
    } catch {
      // Directory may not exist
    }
  }

  before(async () => {
    // Cleanup any leftover test files
    await cleanupAllTestDeployments();
  });

  after(async () => {
    // Cleanup all test files
    await cleanupAllTestDeployments();
    // Remove the entire deployments/test/ tree
    await removeTestDeployments();
  });

  describe("loadDeployment", () => {
    let timestamp: string;

    before(async () => {
      timestamp = generateTimestamp();
      await createTestDeployment(timestamp);
    });

    after(async () => {
      await cleanupTestDeployment(timestamp);
    });

    it("should load a valid deployment file", async () => {
      const deployment = await loadDeployment(TEST_NETWORK, TEST_WORKFLOW, timestamp);

      expect(deployment).to.not.be.undefined;
      expect(deployment.network).to.equal(TEST_NETWORK);
      expect(deployment.timestamp).to.equal(timestamp);
      expect(deployment.deployer).to.be.a("string");

      // Type narrowing for union type
      if ("infrastructure" in deployment) {
        expect(deployment.infrastructure).to.have.property("proxyAdmin");
        expect(deployment.infrastructure).to.have.property("blr");
        expect(deployment.infrastructure).to.have.property("factory");
      }

      if ("facets" in deployment) {
        expect(deployment.facets).to.be.an("array");
      }

      if ("configurations" in deployment) {
        expect(deployment.configurations).to.have.property("equity");
        expect(deployment.configurations).to.have.property("bond");
      }
    });

    it("should parse all deployment fields correctly", async () => {
      const deployment = (await loadDeployment(TEST_NETWORK, TEST_WORKFLOW, timestamp)) as DeploymentOutputType;

      // Check infrastructure
      expect(deployment.infrastructure.proxyAdmin.address).to.include("0x");
      expect(deployment.infrastructure.blr.implementation).to.include("0x");
      expect(deployment.infrastructure.blr.proxy).to.include("0x");
      expect(deployment.infrastructure.factory.implementation).to.include("0x");
      expect(deployment.infrastructure.factory.proxy).to.include("0x");

      // Check facets
      expect(deployment.facets.length).to.be.greaterThan(0);
      expect(deployment.facets[0]).to.have.property("name");
      expect(deployment.facets[0]).to.have.property("address");
      expect(deployment.facets[0]).to.have.property("key");

      // Check configurations
      expect(deployment.configurations.equity.version).to.be.a("number");
      expect(deployment.configurations.equity.facetCount).to.be.a("number");
      expect(deployment.configurations.bond.version).to.be.a("number");
      expect(deployment.configurations.bond.facetCount).to.be.a("number");

      // Check summary
      expect(deployment.summary.success).to.be.true;
      expect(deployment.summary.totalContracts).to.be.a("number");
    });

    it("should throw error for missing file", async () => {
      await expect(loadDeployment(TEST_NETWORK, TEST_WORKFLOW, "2025-01-01T00-00-00")).to.be.rejectedWith(
        "Deployment file not found",
      );
    });

    it("should throw error for invalid JSON", async () => {
      const invalidTimestamp = generateTimestamp();
      const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
      const filename = `${TEST_WORKFLOW}-${invalidTimestamp}.json`;
      const filepath = join(networkDir, filename);

      // Ensure directory exists
      await fs.mkdir(networkDir, { recursive: true });

      // Create invalid JSON file
      await fs.writeFile(filepath, "{ invalid json content");

      try {
        await expect(loadDeployment(TEST_NETWORK, TEST_WORKFLOW, invalidTimestamp)).to.be.rejectedWith(
          "Failed to load deployment",
        );
      } finally {
        await cleanupTestDeployment(invalidTimestamp);
      }
    });
  });

  describe("findLatestDeployment", () => {
    const timestamps = ["2025-11-08T10-00-00", "2025-11-08T11-00-00", "2025-11-08T12-00-00"];

    before(async () => {
      // Create multiple test deployments
      await Promise.all(timestamps.map((ts) => createTestDeployment(ts)));
    });

    after(async () => {
      // Cleanup all test deployments
      await Promise.all(timestamps.map((ts) => cleanupTestDeployment(ts)));
    });

    it("should return the latest deployment", async () => {
      const latest = await findLatestDeployment(TEST_NETWORK, TEST_WORKFLOW);

      expect(latest).to.not.be.null;
      expect(latest!.timestamp).to.equal("2025-11-08T12-00-00"); // Most recent
      expect(latest!.network).to.equal(TEST_NETWORK);
    });

    it("should return null for network with no deployments", async () => {
      const latest = await findLatestDeployment("nonexistent-network", TEST_WORKFLOW);
      expect(latest).to.be.null;
    });
  });

  describe("listDeploymentsByWorkflow (without workflow filter)", () => {
    const timestamps = ["2025-11-08T10-00-00", "2025-11-08T11-00-00", "2025-11-08T12-00-00"];

    before(async () => {
      // Create multiple test deployments
      await Promise.all(timestamps.map((ts) => createTestDeployment(ts)));
    });

    after(async () => {
      // Cleanup all test deployments
      await Promise.all(timestamps.map((ts) => cleanupTestDeployment(ts)));
    });

    it("should list all files for a network", async () => {
      const files = await listDeploymentsByWorkflow(TEST_NETWORK);

      expect(files).to.be.an("array");
      expect(files.length).to.equal(3);
      files.forEach((file: string) => {
        expect(file).to.include(TEST_WORKFLOW);
        expect(file).to.include(".json");
      });
    });

    it("should sort files by timestamp (newest first)", async () => {
      const files = await listDeploymentsByWorkflow(TEST_NETWORK);

      expect(files[0]).to.include("12-00-00"); // Latest
      expect(files[1]).to.include("11-00-00"); // Middle
      expect(files[2]).to.include("10-00-00"); // Earliest
    });

    it("should return empty array for network with no deployments", async () => {
      const files = await listDeploymentsByWorkflow("nonexistent-network");
      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });

    it("should filter files by network correctly", async () => {
      // Create deployment for different network
      const otherNetwork = "test/other-network";
      const otherTimestamp = generateTimestamp();

      await createTestDeployment(otherTimestamp);

      // Also create one for the other network
      const otherDeployment = createSampleDeployment(otherTimestamp);
      otherDeployment.network = otherNetwork;
      const otherNetworkDir = join(TEST_DEPLOYMENTS_DIR, otherNetwork);
      const otherFilename = `${TEST_WORKFLOW}-${otherTimestamp}.json`;
      await fs.mkdir(otherNetworkDir, { recursive: true });
      await fs.writeFile(join(otherNetworkDir, otherFilename), JSON.stringify(otherDeployment));

      try {
        // List files for test network
        const testFiles = await listDeploymentsByWorkflow(TEST_NETWORK);
        expect(testFiles.every((f: string) => f.startsWith(TEST_WORKFLOW))).to.be.true;
        expect(testFiles.length).to.equal(4); // 3 original + 1 new

        // List files for other network
        const otherFiles = await listDeploymentsByWorkflow(otherNetwork);
        expect(otherFiles.every((f: string) => f.startsWith(TEST_WORKFLOW))).to.be.true;
        expect(otherFiles.length).to.equal(1);
      } finally {
        // Cleanup
        await cleanupTestDeployment(otherTimestamp);
        await fs.unlink(join(otherNetworkDir, otherFilename)).catch(() => {});
        await fs.rmdir(otherNetworkDir).catch(() => {});
      }
    });

    it("should handle deployments directory not existing", async () => {
      // Test with network that would create path to non-existent dir
      // This tests the ENOENT error handling
      const files = await listDeploymentsByWorkflow("network-with-no-dir");
      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });
  });

  describe("saveDeploymentOutput", () => {
    afterEach(async () => {
      // Cleanup any test files created
      await cleanupAllTestDeployments();
    });

    it("should return correct filename when customPath is provided", async () => {
      const customPath = "/tmp/my-custom-deployment.json";
      const mockData = createSampleDeployment("2025-12-29T10-00-00");

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: mockData,
        customPath,
      });

      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.filename).to.equal("my-custom-deployment.json");
        expect(result.filepath).to.equal(customPath);
      }
    });

    it("should return correct filename when using default path generation", async () => {
      const mockData = createSampleDeployment("2025-12-29T10-00-00");

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: mockData,
      });

      expect(result.success).to.be.true;
      if (result.success) {
        // Filename should match workflow prefix pattern
        expect(result.filename).to.match(/^newBlr-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}\.json$/);
        expect(result.filename).to.not.equal("unknown");
      }
    });

    it("should handle Windows-style paths correctly", async () => {
      const windowsPath = "C:\\deployments\\test.json";
      const mockData = createSampleDeployment("2025-12-29T10-00-00");

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: mockData,
        customPath: windowsPath,
      });

      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.filename).to.equal("test.json");
        expect(result.filepath).to.equal(windowsPath);
      }

      // Cleanup the weird path created on Unix systems
      try {
        await fs.unlink(windowsPath);
        await fs.rm("C:\\deployments", { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should extract filename from nested paths correctly", async () => {
      const nestedPath = join(TEST_DEPLOYMENTS_DIR, "test/very/deep/nested/path/to/deployment-file.json");
      const mockData = createSampleDeployment("2025-12-29T10-00-00");

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: mockData,
        customPath: nestedPath,
      });

      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.filename).to.equal("deployment-file.json");
      }

      // Cleanup
      try {
        await fs.unlink(nestedPath);
        await fs.rm(join(TEST_DEPLOYMENTS_DIR, "test/very"), { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });
  });

  describe("generateTimestamp", () => {
    it("should return filename-safe ISO format", () => {
      const timestamp = generateTimestamp();

      // Format should be: YYYY-MM-DDTHH-MM-SS
      expect(timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}$/);
    });

    it("should not contain colons or periods", () => {
      const timestamp = generateTimestamp();

      expect(timestamp).to.not.include(":");
      expect(timestamp).to.not.include(".");
    });

    it("should generate unique timestamps for subsequent calls with time advancement", () => {
      // Use sinon fake timers to advance time instantly (no real delay)
      // Uses TEST_TIMESTAMPS.ISO_SAMPLE as base time
      const clock = sinon.useFakeTimers(new Date(TEST_TIMESTAMPS.ISO_SAMPLE));

      try {
        const timestamp1 = generateTimestamp();

        // Verify first timestamp matches expected format from constants
        expect(timestamp1).to.equal(TEST_TIMESTAMPS.FILENAME_SAMPLE);

        // Advance time by 2 seconds (instant, no real delay)
        clock.tick(2000);

        const timestamp2 = generateTimestamp();

        // Verify timestamps are different after time advancement
        expect(timestamp1).to.not.equal(timestamp2);

        // Verify second timestamp has correct format and is later
        expect(timestamp2).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}$/);
        expect(timestamp2 > timestamp1).to.be.true; // Lexicographic comparison works for ISO format
      } finally {
        clock.restore();
      }
    });

    it("should be parseable back to a valid date", () => {
      const timestamp = generateTimestamp();

      // Convert back to ISO format with colons and period for milliseconds
      const isoFormat = timestamp.replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})$/, "T$1:$2:$3.$4Z");
      const date = new Date(isoFormat);

      expect(isNaN(date.getTime())).to.be.false;
    });
  });

  describe("generateDeploymentFilename", () => {
    it("should generate filename with workflow and timestamp", () => {
      const filename = generateDeploymentFilename(TEST_WORKFLOWS.NEW_BLR, TEST_TIMESTAMPS.FILENAME_SAMPLE);

      expect(filename).to.equal(`newBlr-${TEST_TIMESTAMPS.FILENAME_SAMPLE}.json`);
    });

    it("should use current timestamp when not provided", () => {
      const filename = generateDeploymentFilename(TEST_WORKFLOWS.NEW_BLR);

      expect(filename).to.match(/^newBlr-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}\.json$/);
    });

    it("should handle existingBlr workflow", () => {
      const filename = generateDeploymentFilename(TEST_WORKFLOWS.EXISTING_BLR, TEST_TIMESTAMPS.FILENAME_SAMPLE);

      expect(filename).to.equal(`existingBlr-${TEST_TIMESTAMPS.FILENAME_SAMPLE}.json`);
    });

    it("should handle upgradeConfigurations workflow", () => {
      const filename = generateDeploymentFilename(TEST_WORKFLOWS.UPGRADE_CONFIGS, TEST_TIMESTAMPS.FILENAME_SAMPLE);

      expect(filename).to.equal(`upgradeConfigurations-${TEST_TIMESTAMPS.FILENAME_SAMPLE}.json`);
    });

    it("should handle upgradeTupProxies workflow", () => {
      const filename = generateDeploymentFilename(TEST_WORKFLOWS.UPGRADE_TUP, TEST_TIMESTAMPS.FILENAME_SAMPLE);

      expect(filename).to.equal(`upgradeTupProxies-${TEST_TIMESTAMPS.FILENAME_SAMPLE}.json`);
    });

    it("should use workflow name directly for unregistered workflows", () => {
      // Cast to WorkflowType to test custom workflow behavior
      const customWorkflow = "customWorkflow" as unknown as typeof TEST_WORKFLOWS.NEW_BLR;
      const filename = generateDeploymentFilename(customWorkflow, TEST_TIMESTAMPS.FILENAME_SAMPLE);

      expect(filename).to.equal(`customWorkflow-${TEST_TIMESTAMPS.FILENAME_SAMPLE}.json`);
    });
  });

  describe("getDeploymentsDir", () => {
    it("should return an absolute path", () => {
      const dir = getDeploymentsDir();

      expect(dir).to.be.a("string");
      expect(dir.startsWith("/")).to.be.true; // Unix absolute path
    });

    it("should end with deployments directory", () => {
      const dir = getDeploymentsDir();

      expect(dir.endsWith("deployments")).to.be.true;
    });

    it("should return consistent value on multiple calls", () => {
      const dir1 = getDeploymentsDir();
      const dir2 = getDeploymentsDir();

      expect(dir1).to.equal(dir2);
    });
  });

  describe("getNetworkDeploymentDir", () => {
    it("should append network to deployments dir", () => {
      const networkDir = getNetworkDeploymentDir(TEST_NETWORK);

      expect(networkDir).to.include(TEST_NETWORK);
      expect(networkDir.endsWith(TEST_NETWORK)).to.be.true;
    });

    it("should use custom deployments dir when provided", () => {
      const customBase = "/custom/deployments";
      const networkDir = getNetworkDeploymentDir(TEST_NETWORK, customBase);

      expect(networkDir).to.equal(`${customBase}/${TEST_NETWORK}`);
    });

    it("should handle network names with special characters", () => {
      const specialNetwork = "hedera-testnet-v2";
      const networkDir = getNetworkDeploymentDir(specialNetwork);

      expect(networkDir).to.include(specialNetwork);
    });
  });

  describe("loadDeploymentByWorkflow", () => {
    let timestamp: string;

    before(async () => {
      timestamp = generateTimestamp();
      await createTestDeployment(timestamp);
    });

    after(async () => {
      await cleanupTestDeployment(timestamp);
    });

    it("should load deployment with explicit timestamp", async () => {
      const deployment = await loadDeploymentByWorkflow({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        timestamp,
      });

      expect(deployment).to.not.be.null;
      expect(deployment!.timestamp).to.equal(timestamp);
    });

    it("should load latest deployment when useLast is true", async () => {
      const deployment = await loadDeploymentByWorkflow({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        useLast: true,
      });

      expect(deployment).to.not.be.null;
      expect(deployment!.network).to.equal(TEST_NETWORK);
    });

    it("should return null when no timestamp and useLast is false", async () => {
      const deployment = await loadDeploymentByWorkflow({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
      });

      expect(deployment).to.be.null;
    });

    it("should return null for nonexistent network", async () => {
      const deployment = await loadDeploymentByWorkflow({
        network: "nonexistent-network",
        workflow: TEST_WORKFLOW,
        useLast: true,
      });

      expect(deployment).to.be.null;
    });

    it("should return null for invalid timestamp", async () => {
      const deployment = await loadDeploymentByWorkflow({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        timestamp: "2020-01-01T00-00-00", // Does not exist
      });

      expect(deployment).to.be.null;
    });
  });

  describe("listDeploymentsByWorkflow (with workflow filter)", () => {
    const timestamps = ["2025-11-08T16-00-00", "2025-11-08T17-00-00", "2025-11-08T18-00-00"];

    before(async () => {
      await Promise.all(timestamps.map((ts) => createTestDeployment(ts)));
    });

    after(async () => {
      await Promise.all(timestamps.map((ts) => cleanupTestDeployment(ts)));
    });

    it("should list files for specific workflow", async () => {
      const files = await listDeploymentsByWorkflow(TEST_NETWORK, TEST_WORKFLOW);

      expect(files).to.be.an("array");
      expect(files.length).to.be.greaterThanOrEqual(3);
      files.forEach((file: string) => {
        expect(file).to.include(TEST_WORKFLOW);
      });
    });

    it("should filter out non-JSON files", async () => {
      // Create a non-JSON file temporarily
      const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
      const nonJsonFile = join(networkDir, "readme.txt");
      await fs.writeFile(nonJsonFile, "test content");

      try {
        const files = await listDeploymentsByWorkflow(TEST_NETWORK, TEST_WORKFLOW);
        expect(files.every((f: string) => f.endsWith(".json"))).to.be.true;
      } finally {
        await fs.unlink(nonJsonFile).catch(() => {});
      }
    });

    it("should filter out hidden files", async () => {
      const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
      const hiddenFile = join(networkDir, ".hidden.json");
      await fs.writeFile(hiddenFile, "{}");

      try {
        const files = await listDeploymentsByWorkflow(TEST_NETWORK, TEST_WORKFLOW);
        expect(files.every((f: string) => !f.startsWith("."))).to.be.true;
      } finally {
        await fs.unlink(hiddenFile).catch(() => {});
      }
    });

    it("should return all workflows when workflow not specified", async () => {
      // Create a deployment with different workflow name
      const networkDir = join(TEST_DEPLOYMENTS_DIR, TEST_NETWORK);
      const otherWorkflowFile = join(networkDir, `${TEST_WORKFLOWS.EXISTING_BLR}-2025-11-08T19-00-00.json`);
      await fs.writeFile(otherWorkflowFile, JSON.stringify(createSampleDeployment("2025-11-08T19-00-00")));

      try {
        const files = await listDeploymentsByWorkflow(TEST_NETWORK);

        // Should include both workflow types
        const hasNewBlr = files.some((f: string) => f.includes(TEST_WORKFLOWS.NEW_BLR));
        const hasExistingBlr = files.some((f: string) => f.includes(TEST_WORKFLOWS.EXISTING_BLR));

        expect(hasNewBlr).to.be.true;
        expect(hasExistingBlr).to.be.true;
      } finally {
        await fs.unlink(otherWorkflowFile).catch(() => {});
      }
    });

    it("should return empty array for nonexistent directory", async () => {
      const files = await listDeploymentsByWorkflow("totally-fake-network", TEST_WORKFLOW);

      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });
  });

  describe("findLatestDeployment edge cases", () => {
    it("should return null when JSON file is corrupted", async () => {
      const networkDir = join(TEST_DEPLOYMENTS_DIR, "test/corrupted-network");
      const filename = `${TEST_WORKFLOW}-2025-11-08T20-00-00.json`;
      const filepath = join(networkDir, filename);

      await fs.mkdir(networkDir, { recursive: true });
      await fs.writeFile(filepath, "{ invalid json }");

      try {
        const latest = await findLatestDeployment("test/corrupted-network", TEST_WORKFLOW);
        expect(latest).to.be.null; // Should handle corrupted file gracefully
      } finally {
        await fs.unlink(filepath).catch(() => {});
        await fs.rmdir(networkDir).catch(() => {});
      }
    });

    it("should handle empty directory", async () => {
      const emptyNetwork = "test/empty-network";
      const networkDir = join(TEST_DEPLOYMENTS_DIR, emptyNetwork);
      await fs.mkdir(networkDir, { recursive: true });

      try {
        const latest = await findLatestDeployment(emptyNetwork, TEST_WORKFLOW);
        expect(latest).to.be.null;
      } finally {
        await fs.rmdir(networkDir).catch(() => {});
      }
    });
  });

  describe("saveDeploymentOutput edge cases", () => {
    afterEach(async () => {
      await cleanupAllTestDeployments();
    });

    it("should create parent directories automatically", async () => {
      const mockData = createSampleDeployment(TEST_TIMESTAMPS.FILENAME_SAMPLE);

      const result = await saveDeploymentOutput({
        network: "test/deep/nested/new-network",
        workflow: TEST_WORKFLOW,
        data: mockData,
      });

      expect(result.success).to.be.true;

      // Cleanup
      try {
        if (result.success) {
          await fs.unlink(result.filepath);
        }
        await fs.rm(join(TEST_DEPLOYMENTS_DIR, "test/deep"), { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should handle data with circular reference gracefully", async () => {
      // Create data with circular reference (will fail JSON.stringify)
      const circularData: Record<string, unknown> = { name: "test" };
      circularData.self = circularData;

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: circularData as unknown as DeploymentOutputType,
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error).to.include("circular");
      }
    });

    it("should return failure result for permission errors", async () => {
      // Try to write to a read-only location (system directory)
      // This test may not work on all systems, so we simulate with invalid path chars
      const invalidPath = join("/\0invalid", "deployment.json");
      const mockData = createSampleDeployment(TEST_TIMESTAMPS.FILENAME_SAMPLE);

      const result = await saveDeploymentOutput({
        network: TEST_NETWORK,
        workflow: TEST_WORKFLOW,
        data: mockData,
        customPath: invalidPath,
      });

      expect(result.success).to.be.false;
      if (!result.success) {
        expect(result.error).to.be.a("string");
      }
    });
  });

  describe("Integration", () => {
    const timestamps = ["2025-11-08T14-00-00", "2025-11-08T15-00-00"];

    before(async () => {
      await Promise.all(timestamps.map((ts) => createTestDeployment(ts)));
    });

    after(async () => {
      await Promise.all(timestamps.map((ts) => cleanupTestDeployment(ts)));
    });

    it("should work together: list, find latest, load", async () => {
      // List all files
      const files = await listDeploymentsByWorkflow(TEST_NETWORK);
      expect(files.length).to.be.greaterThan(0);

      // Find latest
      const latest = await findLatestDeployment(TEST_NETWORK, TEST_WORKFLOW);
      expect(latest).to.not.be.null;

      // Load the latest explicitly
      const loaded = (await loadDeployment(TEST_NETWORK, TEST_WORKFLOW, latest!.timestamp)) as DeploymentOutputType;
      expect(loaded.timestamp).to.equal(latest!.timestamp);

      // Type narrowing for union type
      if ("infrastructure" in loaded && "infrastructure" in latest!) {
        expect(loaded.infrastructure.blr.proxy).to.equal(latest!.infrastructure.blr.proxy);
      }
    });
  });
});
