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
import { promises as fs } from "fs";
import { join } from "path";
import {
  loadDeployment,
  findLatestDeployment,
  listDeploymentFiles,
  saveDeploymentOutput,
  generateTimestamp,
  type DeploymentOutputType,
} from "@scripts/infrastructure";
import { TEST_ADDRESSES, TEST_CONFIG_IDS, TEST_WORKFLOWS } from "@test";

describe("Deployment File Utilities", () => {
  const TEST_DEPLOYMENTS_DIR = join(__dirname, "../../../../deployments");
  const TEST_NETWORK = "test-network";
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
            key: TEST_CONFIG_IDS.EQUITY,
            address: TEST_ADDRESSES.VALID_2,
          },
        ],
      },
    },
    summary: {
      totalContracts: 48,
      totalFacets: 1,
      totalConfigurations: 2,
      deploymentTime: 5000,
      gasUsed: "0",
      success: true,
    },
    helpers: {
      getEquityFacets: () => [],
      getBondFacets: () => [],
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

  describe("listDeploymentFiles", () => {
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
      const files = await listDeploymentFiles(TEST_NETWORK);

      expect(files).to.be.an("array");
      expect(files.length).to.equal(3);
      files.forEach((file) => {
        expect(file).to.include(TEST_WORKFLOW);
        expect(file).to.include(".json");
      });
    });

    it("should sort files by timestamp (newest first)", async () => {
      const files = await listDeploymentFiles(TEST_NETWORK);

      expect(files[0]).to.include("12-00-00"); // Latest
      expect(files[1]).to.include("11-00-00"); // Middle
      expect(files[2]).to.include("10-00-00"); // Earliest
    });

    it("should return empty array for network with no deployments", async () => {
      const files = await listDeploymentFiles("nonexistent-network");
      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });

    it("should filter files by network correctly", async () => {
      // Create deployment for different network
      const otherNetwork = "other-network";
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
        const testFiles = await listDeploymentFiles(TEST_NETWORK);
        expect(testFiles.every((f) => f.startsWith(TEST_WORKFLOW))).to.be.true;
        expect(testFiles.length).to.equal(4); // 3 original + 1 new

        // List files for other network
        const otherFiles = await listDeploymentFiles(otherNetwork);
        expect(otherFiles.every((f) => f.startsWith(TEST_WORKFLOW))).to.be.true;
        expect(otherFiles.length).to.equal(1);
      } finally {
        // Cleanup
        await cleanupTestDeployment(otherTimestamp);
        await fs.unlink(join(otherNetworkDir, otherFilename));
      }
    });

    it("should handle deployments directory not existing", async () => {
      // Test with network that would create path to non-existent dir
      // This tests the ENOENT error handling
      const files = await listDeploymentFiles("network-with-no-dir");
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
        expect(result.filename).to.match(/^newBlr-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
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
      const nestedPath = join(TEST_DEPLOYMENTS_DIR, "very/deep/nested/path/to/deployment-file.json");
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
        await fs.rm(join(TEST_DEPLOYMENTS_DIR, "very"), { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
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
      const files = await listDeploymentFiles(TEST_NETWORK);
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
