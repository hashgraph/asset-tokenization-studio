// SPDX-License-Identifier: Apache-2.0

/**
 * Tests for deployment file utilities.
 *
 * These tests validate the functionality of loading, listing, and finding
 * deployment output files. Uses temporary test deployments to avoid
 * dependency on actual deployment files.
 */

import { expect } from "chai";
import { promises as fs } from "fs";
import { join } from "path";
import { loadDeployment, findLatestDeployment, listDeploymentFiles } from "../../../../scripts/infrastructure";
import type { DeploymentOutput } from "../../../../scripts/workflows/deploySystemWithNewBlr";

describe("Deployment File Utilities", () => {
  const TEST_DEPLOYMENTS_DIR = join(__dirname, "../../../../deployments");
  const TEST_NETWORK = "test-network";

  // Sample deployment data
  const createSampleDeployment = (timestamp: string): DeploymentOutput => ({
    network: TEST_NETWORK,
    timestamp,
    deployer: "0x1234567890123456789012345678901234567890",
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
        address: "0xFacet1234567890123456789012345678901234",
        key: "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    ],
    configurations: {
      equity: {
        configId: "0x0000000000000000000000000000000000000000000000000000000000000001",
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: "0x0000000000000000000000000000000000000000000000000000000000000001",
            address: "0xFacet1234567890123456789012345678901234",
          },
        ],
      },
      bond: {
        configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
        version: 1,
        facetCount: 43,
        facets: [
          {
            facetName: "AccessControlFacet",
            key: "0x0000000000000000000000000000000000000000000000000000000000000001",
            address: "0xFacet1234567890123456789012345678901234",
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
    const filename = `${TEST_NETWORK}_${timestamp}.json`;
    const filepath = join(TEST_DEPLOYMENTS_DIR, filename);

    // Ensure deployments directory exists
    try {
      await fs.mkdir(TEST_DEPLOYMENTS_DIR, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }

    await fs.writeFile(filepath, JSON.stringify(deployment, null, 2));
  }

  // Helper to cleanup test deployment file
  async function cleanupTestDeployment(timestamp: string): Promise<void> {
    const filename = `${TEST_NETWORK}_${timestamp}.json`;
    const filepath = join(TEST_DEPLOYMENTS_DIR, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File may not exist
    }
  }

  // Cleanup all test deployment files
  async function cleanupAllTestDeployments(): Promise<void> {
    try {
      const files = await fs.readdir(TEST_DEPLOYMENTS_DIR);
      const testFiles = files.filter((f) => f.startsWith(`${TEST_NETWORK}_`));

      await Promise.all(testFiles.map((f) => fs.unlink(join(TEST_DEPLOYMENTS_DIR, f))));
    } catch (error) {
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
    const timestamp = "2025-11-08_10-30-45";

    before(async () => {
      await createTestDeployment(timestamp);
    });

    after(async () => {
      await cleanupTestDeployment(timestamp);
    });

    it("should load a valid deployment file", async () => {
      const deployment = await loadDeployment(TEST_NETWORK, timestamp);

      expect(deployment).to.not.be.undefined;
      expect(deployment.network).to.equal(TEST_NETWORK);
      expect(deployment.timestamp).to.equal(timestamp);
      expect(deployment.deployer).to.be.a("string");
      expect(deployment.infrastructure).to.have.property("proxyAdmin");
      expect(deployment.infrastructure).to.have.property("blr");
      expect(deployment.infrastructure).to.have.property("factory");
      expect(deployment.facets).to.be.an("array");
      expect(deployment.configurations).to.have.property("equity");
      expect(deployment.configurations).to.have.property("bond");
    });

    it("should parse all deployment fields correctly", async () => {
      const deployment = await loadDeployment(TEST_NETWORK, timestamp);

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
      await expect(loadDeployment(TEST_NETWORK, "2025-01-01_00-00-00")).to.be.rejectedWith("Deployment file not found");
    });

    it("should throw error for invalid JSON", async () => {
      const invalidTimestamp = "2025-11-08_11-00-00";
      const filename = `${TEST_NETWORK}_${invalidTimestamp}.json`;
      const filepath = join(TEST_DEPLOYMENTS_DIR, filename);

      // Create invalid JSON file
      await fs.writeFile(filepath, "{ invalid json content");

      try {
        await expect(loadDeployment(TEST_NETWORK, invalidTimestamp)).to.be.rejectedWith("Failed to load deployment");
      } finally {
        await cleanupTestDeployment(invalidTimestamp);
      }
    });
  });

  describe("findLatestDeployment", () => {
    const timestamps = ["2025-11-08_10-00-00", "2025-11-08_11-00-00", "2025-11-08_12-00-00"];

    before(async () => {
      // Create multiple test deployments
      await Promise.all(timestamps.map((ts) => createTestDeployment(ts)));
    });

    after(async () => {
      // Cleanup all test deployments
      await Promise.all(timestamps.map((ts) => cleanupTestDeployment(ts)));
    });

    it("should return the latest deployment", async () => {
      const latest = await findLatestDeployment(TEST_NETWORK);

      expect(latest).to.not.be.null;
      expect(latest!.timestamp).to.equal("2025-11-08_12-00-00"); // Most recent
      expect(latest!.network).to.equal(TEST_NETWORK);
    });

    it("should return null for network with no deployments", async () => {
      const latest = await findLatestDeployment("nonexistent-network");
      expect(latest).to.be.null;
    });
  });

  describe("listDeploymentFiles", () => {
    const timestamps = ["2025-11-08_10-00-00", "2025-11-08_11-00-00", "2025-11-08_12-00-00"];

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
        expect(file).to.include(TEST_NETWORK);
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
      const otherTimestamp = "2025-11-08_13-00-00";

      await createTestDeployment(otherTimestamp);

      // Also create one for the other network
      const otherDeployment = createSampleDeployment(otherTimestamp);
      otherDeployment.network = otherNetwork;
      const otherFilename = `${otherNetwork}_${otherTimestamp}.json`;
      await fs.writeFile(join(TEST_DEPLOYMENTS_DIR, otherFilename), JSON.stringify(otherDeployment));

      try {
        // List files for test network
        const testFiles = await listDeploymentFiles(TEST_NETWORK);
        expect(testFiles.every((f) => f.startsWith(TEST_NETWORK))).to.be.true;
        expect(testFiles.some((f) => f.startsWith(otherNetwork))).to.be.false;

        // List files for other network
        const otherFiles = await listDeploymentFiles(otherNetwork);
        expect(otherFiles.every((f) => f.startsWith(otherNetwork))).to.be.true;
        expect(otherFiles.length).to.equal(1);
      } finally {
        // Cleanup
        await cleanupTestDeployment(otherTimestamp);
        await fs.unlink(join(TEST_DEPLOYMENTS_DIR, otherFilename));
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

  describe("Integration", () => {
    const timestamps = ["2025-11-08_14-00-00", "2025-11-08_15-00-00"];

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
      const latest = await findLatestDeployment(TEST_NETWORK);
      expect(latest).to.not.be.null;

      // Load the latest explicitly
      const loaded = await loadDeployment(TEST_NETWORK, latest!.timestamp);
      expect(loaded.timestamp).to.equal(latest!.timestamp);
      expect(loaded.infrastructure.blr.proxy).to.equal(latest!.infrastructure.blr.proxy);
    });
  });
});
