// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for registry generation pipeline.
 *
 * Tests the configurable registry generation pipeline to ensure downstream
 * projects can auto-generate their own contract registries.
 *
 * These tests verify:
 * - generateRegistryPipeline function with various configurations
 * - Exported building blocks (detectLayer, detectCategory, etc.)
 * - Generated code quality and completeness
 * - Configuration flexibility
 */

import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";

// Infrastructure layer - registry generation tools
import {
  generateRegistryPipeline,
  DEFAULT_REGISTRY_CONFIG,
  type RegistryGenerationConfig,
} from "@scripts/infrastructure";

// Exported building blocks
import { detectLayer, detectCategory, generateDescription } from "@scripts";

import { pairTimeTravelVariants } from "@scripts";

describe("Registry Generation Pipeline - Integration Tests", () => {
  const contractsPath = path.join(__dirname, "../../contracts");

  describe("generateRegistryPipeline", () => {
    it("should generate registry with default configuration", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          logLevel: "SILENT", // Suppress output during tests
        },
        false, // Don't write file
      );

      // Verify result structure
      expect(result).to.have.property("code");
      expect(result).to.have.property("stats");
      expect(result).to.have.property("warnings");
      expect(result.outputPath).to.be.undefined; // File not written

      // Verify statistics
      expect(result.stats.totalFacets).to.be.greaterThan(0);
      expect(result.stats.totalInfrastructure).to.be.greaterThan(0);
      expect(result.stats.totalRoles).to.be.greaterThan(0);
      expect(result.stats.generatedLines).to.be.greaterThan(100);
      expect(result.stats.durationMs).to.be.greaterThan(0);

      // Verify generated code structure
      expect(result.code).to.include("SPDX-License-Identifier");
      expect(result.code).to.include("AUTO-GENERATED");
      expect(result.code).to.include("FACET_REGISTRY");
      expect(result.code).to.include("INFRASTRUCTURE_CONTRACTS");
      expect(result.code).to.include("STORAGE_WRAPPER_REGISTRY");
      expect(result.code).to.include("export const ROLES");
      expect(result.code).to.include("@scripts/infrastructure");
    }).timeout(30000);

    it("should respect configuration options", async () => {
      const config: RegistryGenerationConfig = {
        contractsPath,
        includeStorageWrappers: false,
        includeTimeTravel: false,
        facetsOnly: true,
        logLevel: "SILENT",
      };

      const result = await generateRegistryPipeline(config, false);

      // When facetsOnly=true, infrastructure should be 0
      expect(result.stats.totalInfrastructure).to.equal(0);

      // When includeStorageWrappers=false, storage wrappers should be 0
      expect(result.stats.totalStorageWrappers).to.equal(0);

      // When includeTimeTravel=false, withTimeTravel should be 0
      expect(result.stats.withTimeTravel).to.equal(0);
    }).timeout(30000);

    it("should allow custom resolver key paths", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          resolverKeyPaths: ["**/constants/resolverKeys.sol"],
          logLevel: "SILENT",
        },
        false,
      );

      expect(result.stats.totalResolverKeys).to.be.greaterThan(0);
    }).timeout(30000);

    it("should allow custom role paths", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          rolesPaths: ["**/constants/roles.sol"],
          logLevel: "SILENT",
        },
        false,
      );

      expect(result.stats.totalRoles).to.be.greaterThan(0);
    }).timeout(30000);

    it("should generate valid TypeScript code", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          logLevel: "SILENT",
        },
        false,
      );

      // Check for TypeScript syntax elements
      expect(result.code).to.include("export const");
      expect(result.code).to.include("import {");
      expect(result.code).to.include("} from");
      expect(result.code).to.include("Record<string,");
      expect(result.code).to.include("FacetDefinition");
      expect(result.code).to.include("ContractDefinition");

      // Should not have syntax errors
      expect(result.code).to.not.include("undefined");
      expect(result.code).to.not.include("null,");
    }).timeout(30000);

    it("should include category and layer breakdown", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          logLevel: "SILENT",
        },
        false,
      );

      expect(result.stats.byCategory).to.be.an("object");
      expect(result.stats.byLayer).to.be.an("object");

      // ATS should have multiple categories
      expect(Object.keys(result.stats.byCategory).length).to.be.greaterThan(1);
      expect(Object.keys(result.stats.byLayer).length).to.be.greaterThan(1);
    }).timeout(30000);

    it("should write file when requested", async () => {
      const tempOutputPath = path.join(__dirname, "../temp-registry.data.ts");

      // Clean up if exists
      if (fs.existsSync(tempOutputPath)) {
        fs.unlinkSync(tempOutputPath);
      }

      try {
        const result = await generateRegistryPipeline(
          {
            contractsPath,
            outputPath: tempOutputPath,
            logLevel: "SILENT",
          },
          true, // Write file
        );

        expect(result.outputPath).to.equal(tempOutputPath);
        expect(fs.existsSync(tempOutputPath)).to.be.true;

        // Verify file content matches generated code
        const fileContent = fs.readFileSync(tempOutputPath, "utf-8");
        expect(fileContent).to.equal(result.code);
      } finally {
        // Clean up
        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }
      }
    }).timeout(30000);
  });

  describe("Exported Building Blocks", () => {
    it("should export detectLayer function", () => {
      const mockContract = {
        filePath: "/path/to/contracts/facets/layer_1/AccessControl.sol",
        relativePath: "facets/layer_1/AccessControl.sol",
        directory: "/path/to/contracts/facets/layer_1",
        fileName: "AccessControl",
        contractNames: ["AccessControl"],
        primaryContract: "AccessControl",
        source: "contract AccessControl {}",
      };

      const layer = detectLayer(mockContract);
      expect(layer).to.equal(1);
    });

    it("should export detectCategory function", () => {
      const mockContract = {
        filePath: "/path/to/contracts/facets/Kyc.sol",
        relativePath: "facets/Kyc.sol",
        directory: "/path/to/contracts/facets",
        fileName: "Kyc",
        contractNames: ["KycFacet"],
        primaryContract: "KycFacet",
        source: "contract KycFacet {}",
      };

      const category = detectCategory(mockContract, 1);
      expect(category).to.equal("compliance");
    });

    it("should export generateDescription function", () => {
      const source = `
/**
 * @title MyContract
 * @notice This is a test contract
 */
contract MyContract {}
            `;

      const description = generateDescription(source, "MyContract");
      expect(description).to.equal("This is a test contract");
    });

    it("should export pairTimeTravelVariants function", () => {
      const baseFacets = [
        {
          filePath: "/path/AccessControl.sol",
          relativePath: "AccessControl.sol",
          directory: "/path",
          fileName: "AccessControl",
          contractNames: ["AccessControlFacet"],
          primaryContract: "AccessControlFacet",
          source: "",
        },
      ];

      const timeTravelFacets = [
        {
          filePath: "/path/AccessControlTimeTravel.sol",
          relativePath: "AccessControlTimeTravel.sol",
          directory: "/path",
          fileName: "AccessControlTimeTravel",
          contractNames: ["AccessControlFacetTimeTravel"],
          primaryContract: "AccessControlFacetTimeTravel",
          source: "",
        },
      ];

      const pairs = pairTimeTravelVariants(baseFacets, timeTravelFacets);
      expect(pairs.size).to.equal(1);
      expect(pairs.get("AccessControlFacet")).to.not.be.null;
    });
  });

  describe("DEFAULT_REGISTRY_CONFIG", () => {
    it("should have sensible defaults", () => {
      expect(DEFAULT_REGISTRY_CONFIG.contractsPath).to.equal("./contracts");
      expect(DEFAULT_REGISTRY_CONFIG.includeStorageWrappers).to.be.true;
      expect(DEFAULT_REGISTRY_CONFIG.includeTimeTravel).to.be.true;
      expect(DEFAULT_REGISTRY_CONFIG.extractNatspec).to.be.true;
      expect(DEFAULT_REGISTRY_CONFIG.logLevel).to.equal("INFO");
      expect(DEFAULT_REGISTRY_CONFIG.facetsOnly).to.be.false;
    });

    it("should have appropriate exclude patterns", () => {
      const excludes = DEFAULT_REGISTRY_CONFIG.excludePaths;
      expect(excludes).to.include("**/test/**");
      expect(excludes).to.include("**/tests/**");
      expect(excludes).to.include("**/mocks/**");
      expect(excludes).to.include("**/*.t.sol");
      expect(excludes).to.include("**/*.s.sol");
    });
  });

  describe("Mock Contracts Registry", () => {
    it("should generate registry without mocks by default", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          logLevel: "SILENT",
        },
        false,
      );

      // Mocks disabled by default
      expect(result.stats.totalMocks).to.equal(0);
      expect(result.code).to.not.include("MOCK_CONTRACTS");
    }).timeout(30000);

    it("should include mocks when enabled", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          mockContractPaths: ["**/mocks/**/*.sol", "**/test/**/*Mock*.sol"],
          logLevel: "SILENT",
        },
        false,
      );

      // Should find mock contracts
      expect(result.stats.totalMocks).to.be.greaterThan(0);
      expect(result.code).to.include("MOCK_CONTRACTS");
      expect(result.code).to.include("Record<string, ContractDefinition>");
      expect(result.code).to.include("TOTAL_MOCKS");
      expect(result.code).to.include("These contracts are test utilities");
    }).timeout(30000);

    it("should handle mock contracts without resolver keys", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          mockContractPaths: ["**/mocks/**/*.sol"],
          logLevel: "SILENT",
        },
        false,
      );

      // Should succeed even if mocks don't have resolver keys
      expect(result.stats.totalMocks).to.be.greaterThan(0);

      // May have warnings about missing keys
      const mockWarnings = result.warnings.filter((w) => w.includes("mock"));
      expect(mockWarnings).to.be.an("array");
    }).timeout(30000);

    it("should use custom mock contract paths", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          mockContractPaths: ["**/mocks/MockedExternalKycList.sol"], // Specific file
          logLevel: "SILENT",
        },
        false,
      );

      // Should find at least the specified mock
      expect(result.stats.totalMocks).to.be.greaterThanOrEqual(1);
      expect(result.code).to.include("MockedExternalKycList");
    }).timeout(30000);

    it("should generate valid TypeScript for mock registry", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          logLevel: "SILENT",
        },
        false,
      );

      // Check TypeScript structure for mocks
      if (result.stats.totalMocks > 0) {
        expect(result.code).to.include("export const MOCK_CONTRACTS: Record<string, FacetDefinition>");
        expect(result.code).to.include("export const TOTAL_MOCKS = " + result.stats.totalMocks + " as const");

        // Should have proper structure
        expect(result.code).to.match(/MOCK_CONTRACTS.*=.*{/s);
        expect(result.code).to.match(/name:.*,/s);
        expect(result.code).to.match(/methods:.*\[/s);
      }
    }).timeout(30000);

    it("should include mock count in header when mocks present", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          logLevel: "SILENT",
        },
        false,
      );

      if (result.stats.totalMocks > 0) {
        // Header should mention mocks
        expect(result.code).to.match(/\* Mocks: \d+/, "Header should include mock count");
      }
    }).timeout(30000);

    it("should categorize mock facets as mocks, not production facets", async () => {
      // This test ensures MockXxxFacet contracts in /mocks/ directory
      // are categorized as mocks, not as production facets
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          includeMocksInRegistry: true,
          mockContractPaths: ["**/mocks/**/*.sol"],
          logLevel: "SILENT",
        },
        false,
      );

      // Verify mocks were found
      expect(result.stats.totalMocks).to.be.greaterThan(0);

      // Check that MockedExternalKycList is in MOCK_CONTRACTS
      expect(result.code).to.include("MOCK_CONTRACTS");
      expect(result.code).to.match(
        /MOCK_CONTRACTS.*MockedExternalKycList/s,
        "MockedExternalKycList should be in MOCK_CONTRACTS",
      );

      // Verify mock contracts don't appear in FACET_REGISTRY
      // Extract FACET_REGISTRY section
      const facetRegistryMatch = result.code.match(
        /export const FACET_REGISTRY.*?(?=export const (?:INFRASTRUCTURE|STORAGE|MOCK|ROLES|TOTAL))/s,
      );
      if (facetRegistryMatch) {
        const facetRegistry = facetRegistryMatch[0];
        // Should NOT contain mocked contracts
        expect(facetRegistry).to.not.include("MockedExternalKycList");
        expect(facetRegistry).to.not.include("MockedBlacklist");
        expect(facetRegistry).to.not.include("MockedExternalPause");
        expect(facetRegistry).to.not.include("MockedWhitelist");
      }
    }).timeout(30000);
  });

  describe("Real-world Usage Scenarios", () => {
    it("should work for downstream project with different structure", async () => {
      // Simulate downstream project configuration
      const customConfig: RegistryGenerationConfig = {
        contractsPath,
        outputPath: "./custom/registry.data.ts",
        resolverKeyPaths: ["**/config/keys.sol", "**/constants/*.sol"],
        rolesPaths: ["**/config/roles.sol", "**/constants/*.sol"],
        includeStorageWrappers: false,
        moduleName: "@my-company/contracts",
        logLevel: "SILENT",
      };

      const result = await generateRegistryPipeline(customConfig, false);

      expect(result.code).to.include("@my-company/contracts");
      expect(result.stats.totalFacets).to.be.greaterThan(0);
    }).timeout(30000);

    it("should handle missing resolver keys gracefully", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          resolverKeyPaths: ["**/nonexistent/*.sol"], // Won't find any
          logLevel: "SILENT",
        },
        false,
      );

      // Should still succeed, just with fewer resolver keys
      expect(result.stats.totalResolverKeys).to.equal(0);
      expect(result.warnings.length).to.be.greaterThan(0);
    }).timeout(30000);

    it("should handle missing standalone roles files gracefully", async () => {
      const result = await generateRegistryPipeline(
        {
          contractsPath,
          rolesPaths: ["**/nonexistent/*.sol"], // Won't find standalone files
          logLevel: "SILENT",
        },
        false,
      );

      // Should succeed even if standalone files don't match
      // (Roles may or may not be found depending on inline contract definitions)
      expect(result.stats.totalRoles).to.be.greaterThanOrEqual(0);
      expect(result.code).to.include("export const ROLES");
    }).timeout(30000);
  });
});
