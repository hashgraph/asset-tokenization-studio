// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for external facet extensibility.
 *
 * These tests verify that the ATS deployment scripts can be extended
 * by downstream projects with custom (non-registry) facets.
 *
 * Tests cover:
 * - Registering external facets in BLR
 * - Configuring external facets alongside ATS facets
 * - Mixed configurations (ATS + external facets)
 * - End-to-end deployment with external facets
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import {
  BusinessLogicResolver__factory,
  AccessControlFacet__factory,
  KycFacet__factory,
  PauseFacet__factory,
  FreezeFacet__factory,
  ProxyAdmin__factory,
} from "@contract-types";

// Infrastructure layer - generic blockchain operations
import {
  deployContract,
  deployProxy,
  deployResolverProxy,
  registerFacets,
  createBatchConfiguration,
  deployFacets,
  LATEST_VERSION,
} from "@scripts/infrastructure";

// Domain layer - ATS-specific business logic
import { EQUITY_CONFIG_ID, atsRegistry } from "@scripts/domain";

// Test helpers
import { TEST_SIZES } from "@test";

describe("External Facet Extensibility - Integration Tests", () => {
  let deployer: Signer;
  let blrAddress: string;
  let blrContract: any;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();

    // Deploy BLR for all tests
    const blrImplementationFactory = new BusinessLogicResolver__factory(deployer);
    const blrResult = await deployProxy(deployer, {
      implementationFactory: blrImplementationFactory,
    });

    expect(blrResult.proxyAddress).to.exist;
    blrAddress = blrResult.proxyAddress;

    // Initialize BLR
    blrContract = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
    await blrContract.initialize_BusinessLogicResolver();
  });

  describe("External Facet Registration", () => {
    // ATS Registry provider for tests
    it("should register an external facet (not in ATS registry) with warning", async () => {
      // Deploy PauseFacet as if it were an external facet
      // (even though it's in the registry, we'll treat it as external for testing)
      const externalFacetFactory = new PauseFacet__factory(deployer);
      const externalFacetResult = await deployContract(externalFacetFactory, {});

      expect(externalFacetResult.success).to.be.true;

      // Verify it exists in registry (for reference)
      const definition = atsRegistry.getFacetDefinition("PauseFacet");
      expect(definition).to.exist;

      // Register the facet - should warn but succeed
      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: externalFacetResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      // Should succeed despite being in registry
      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.SINGLE);
      expect(registerResult.registered[0]).to.equal("PauseFacet");
    });

    it("should register multiple facets including external ones", async () => {
      // Deploy mix of ATS and "external" facets
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      const pauseFactory = new PauseFacet__factory(deployer);
      const pauseResult = await deployContract(pauseFactory, {});

      const kycFactory = new KycFacet__factory(deployer);
      const kycResult = await deployContract(kycFactory, {});

      // Register all facets together
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControlResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
        },
        {
          name: "PauseFacet",
          address: pauseResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kycResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.TRIPLE);
      expect(registerResult.failed.length).to.equal(0);
    });
  });

  describe("External Facet Deployment", () => {
    // ATS Registry provider for tests
    it("should deploy external facets (not in ATS registry) with warning", async () => {
      // Deploy specific facets including an external one
      // PauseFacet is in the registry, but we're testing the code path
      const result = await deployFacets(
        {
          PauseFacet: new PauseFacet__factory(deployer),
          AccessControlFacet: new AccessControlFacet__factory(deployer),
        },
        {},
      );

      expect(result.success).to.be.true;
      expect(result.deployed.size).to.equal(TEST_SIZES.DUAL);
      expect(result.failed.size).to.equal(0);

      // Verify both facets were deployed
      expect(result.deployed.has("PauseFacet")).to.be.true;
      expect(result.deployed.has("AccessControlFacet")).to.be.true;
    });

    it("should deploy only external facets without filtering them out", async () => {
      // In a real scenario, this would be a facet not in the registry
      // For testing, we use a registry facet to verify the code path works
      const result = await deployFacets(
        {
          FreezeFacet: new FreezeFacet__factory(deployer),
        },
        {},
      );

      expect(result.success).to.be.true;
      expect(result.deployed.size).to.equal(TEST_SIZES.SINGLE);
      expect(result.failed.size).to.equal(0);
      expect(result.deployed.has("FreezeFacet")).to.be.true;
    });

    it("should deploy mixed ATS and external facets together", async () => {
      // Deploy a mix of facets
      const result = await deployFacets(
        {
          AccessControlFacet: new AccessControlFacet__factory(deployer),
          KycFacet: new KycFacet__factory(deployer),
          PauseFacet: new PauseFacet__factory(deployer),
          FreezeFacet: new FreezeFacet__factory(deployer),
        },
        {},
      );

      expect(result.success).to.be.true;
      expect(result.deployed.size).to.equal(4);
      expect(result.failed.size).to.equal(0);

      // Verify all facets were deployed
      const deployedNames = Array.from(result.deployed.keys());
      expect(deployedNames).to.include("AccessControlFacet");
      expect(deployedNames).to.include("KycFacet");
      expect(deployedNames).to.include("PauseFacet");
      expect(deployedNames).to.include("FreezeFacet");
    });
  });

  describe("External Facet Configuration", () => {
    // ATS Registry provider for tests
    it("should configure external facet (not in ATS registry) with warning", async () => {
      // Deploy and register a facet
      const pauseFacetFactory = new PauseFacet__factory(deployer);
      const pauseFacetResult = await deployContract(pauseFacetFactory, {});

      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: pauseFacetResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      // Create configuration with external facet
      // This should now WARN but NOT filter out the facet
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("TEST_CONFIG"),
        facets: [
          {
            facetName: "PauseFacet",
            address: pauseFacetResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
        ],
      });

      // Should succeed (this is the key test!)
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.SINGLE);
        expect(configResult.data.facetKeys[0].facetName).to.equal("PauseFacet");
      }
    });

    it("should configure mixed ATS and external facets together", async () => {
      // Deploy ATS facets
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      const kycFactory = new KycFacet__factory(deployer);
      const kycResult = await deployContract(kycFactory, {});

      // Deploy "external" facet
      const pauseFactory = new PauseFacet__factory(deployer);
      const pauseResult = await deployContract(pauseFactory, {});

      // Register all
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControlResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kycResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
        {
          name: "PauseFacet",
          address: pauseResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      // Create mixed configuration
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("MIXED_CONFIG"),
        facets: [
          {
            facetName: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
          {
            facetName: "KycFacet",
            address: kycResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
          },
          {
            facetName: "PauseFacet",
            address: pauseResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
        ],
      });

      // All facets should be included
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.TRIPLE);

        const facetNames = configResult.data.facetKeys.map((f: { facetName: string }) => f.facetName);
        expect(facetNames).to.include("AccessControlFacet");
        expect(facetNames).to.include("KycFacet");
        expect(facetNames).to.include("PauseFacet");
      }
    });

    it("should handle configuration with only external facets", async () => {
      // Deploy only "external" facets
      const pauseFactory = new PauseFacet__factory(deployer);
      const pauseResult = await deployContract(pauseFactory, {});

      const freezeFactory = new FreezeFacet__factory(deployer);
      const freezeResult = await deployContract(freezeFactory, {});

      // Register external facets
      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: pauseResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
        {
          name: "FreezeFacet",
          address: freezeResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      // Create configuration with only external facets
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("EXTERNAL_CONFIG"),
        facets: [
          {
            facetName: "PauseFacet",
            address: pauseResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
          {
            facetName: "FreezeFacet",
            address: freezeResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("FreezeFacet").resolverKey!.value,
          },
        ],
      });

      // Should work fine
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.DUAL);
      }
    });
  });

  describe("End-to-End External Facet Workflow", () => {
    // ATS Registry provider for tests
    it("should complete full deployment with external facets", async () => {
      // Step 1: Deploy ProxyAdmin
      const proxyAdminFactory = new ProxyAdmin__factory(deployer);
      const proxyAdminResult = await deployContract(proxyAdminFactory, {});
      expect(proxyAdminResult.success).to.be.true;

      // Step 2: Deploy ATS facets
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      const kycFactory = new KycFacet__factory(deployer);
      const kycResult = await deployContract(kycFactory, {});

      // Step 3: Deploy external facet (simulating downstream custom facet)
      const customFacetFactory = new PauseFacet__factory(deployer);
      const customFacetResult = await deployContract(customFacetFactory, {});

      expect(accessControlResult.success).to.be.true;
      expect(kycResult.success).to.be.true;
      expect(customFacetResult.success).to.be.true;

      // Step 4: Register all facets (ATS + external)
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControlResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kycResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
        {
          name: "PauseFacet",
          address: customFacetResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.TRIPLE);

      // Step 5: Create configuration with all facets
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: EQUITY_CONFIG_ID,
        facets: [
          {
            facetName: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
          {
            facetName: "KycFacet",
            address: kycResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
          },
          {
            facetName: "PauseFacet",
            address: customFacetResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
        ],
      });

      // Verify configuration succeeded with all facets
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.TRIPLE);
        expect(configResult.data.configurationId).to.equal(EQUITY_CONFIG_ID);

        // Verify external facet is included
        const externalFacet = configResult.data.facetKeys.find(
          (f: { facetName: string }) => f.facetName === "PauseFacet",
        );
        expect(externalFacet).to.exist;
        expect(externalFacet!.address).to.equal(customFacetResult.address);
      }
    });

    it("should skip facets without deployed addresses but include valid external facets", async () => {
      // Deploy only some facets
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      const pauseFactory = new PauseFacet__factory(deployer);
      const pauseResult = await deployContract(pauseFactory, {});

      // Register deployed facets
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControlResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "PauseFacet",
          address: pauseResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      // Try to create configuration with some facets not deployed
      // Only include facets that have been deployed
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("PARTIAL_CONFIG"),
        facets: [
          {
            facetName: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
          {
            facetName: "PauseFacet",
            address: pauseResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
        ],
      });

      // Should succeed with only the 2 deployed facets
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.DUAL);

        const facetNames = configResult.data.facetKeys.map((f: { facetName: string }) => f.facetName);
        expect(facetNames).to.include("AccessControlFacet");
        expect(facetNames).to.include("PauseFacet");
        expect(facetNames).to.not.include("KycFacet");
      }
    });
  });

  describe("Consistency with registerFacets Behavior", () => {
    // ATS Registry provider for tests
    it("should have aligned behavior between registerFacets and createBatchConfiguration", async () => {
      // Deploy an external facet
      const externalFacetFactory = new PauseFacet__factory(deployer);
      const externalFacetResult = await deployContract(externalFacetFactory, {});

      // Register the facet - registerFacets warns but succeeds
      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: externalFacetResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blrContract, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered).to.include("PauseFacet");

      // Configure the same facet - createBatchConfiguration should also warn but succeed
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("CONSISTENCY_TEST"),
        facets: [
          {
            facetName: "PauseFacet",
            address: externalFacetResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("PauseFacet").resolverKey!.value,
          },
        ],
      });

      // Both operations should succeed - this is the core consistency test
      expect(configResult.success).to.be.true;
      if (configResult.success) {
        expect(configResult.data.facetKeys.length).to.equal(TEST_SIZES.SINGLE);
        expect(configResult.data.facetKeys[0].facetName).to.equal("PauseFacet");
      }
    });
  });

  describe("LATEST_VERSION Auto-Updating Proxies", () => {
    it("should deploy proxy with LATEST_VERSION (version: 0)", async () => {
      // Deploy and register facet
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      await registerFacets(blrContract, {
        facets: [
          {
            name: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
        ],
      });

      // Create configuration
      const configId = ethers.utils.formatBytes32String("TEST_CONFIG");
      await createBatchConfiguration(blrContract, {
        configurationId: configId,
        facets: [
          {
            facetName: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
        ],
      });

      // Deploy proxy with explicit version: 0
      const result = await deployResolverProxy(deployer, {
        blrAddress,
        configurationId: configId,
        version: LATEST_VERSION,
        rbac: [],
      });

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.exist;
      expect(result.version).to.equal(LATEST_VERSION);
    });

    it("should deploy proxy with default version (undefined = LATEST_VERSION)", async () => {
      // Deploy and register facet
      const kycFactory = new KycFacet__factory(deployer);
      const kycResult = await deployContract(kycFactory, {});

      await registerFacets(blrContract, {
        facets: [
          {
            name: "KycFacet",
            address: kycResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
          },
        ],
      });

      // Create configuration
      const configId = ethers.utils.formatBytes32String("DEFAULT_TEST");
      await createBatchConfiguration(blrContract, {
        configurationId: configId,
        facets: [
          {
            facetName: "KycFacet",
            address: kycResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
          },
        ],
      });

      // Deploy proxy WITHOUT specifying version (should default to LATEST_VERSION)
      const result = await deployResolverProxy(deployer, {
        blrAddress,
        configurationId: configId,
        // version not specified - should default to LATEST_VERSION
        rbac: [],
      });

      expect(result.success).to.be.true;
      expect(result.proxyAddress).to.exist;
      // Should have used the default LATEST_VERSION
      expect(result.version).to.equal(LATEST_VERSION);
    });
  });

  describe("Configuration Version Management", () => {
    it("should return configuration-specific version from BLR", async () => {
      // Deploy facets using TypeChain factories
      const accessControlFactory = new AccessControlFacet__factory(deployer);
      const accessControlResult = await deployContract(accessControlFactory, {});

      const kycFactory = new KycFacet__factory(deployer);
      const kycResult = await deployContract(kycFactory, {});

      // Register all facets at once
      const facetsToRegister = [
        {
          name: "AccessControlFacet",
          address: accessControlResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kycResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
        },
      ];
      await registerFacets(blrContract, {
        facets: facetsToRegister,
      });

      // Create first configuration
      const firstConfigId = ethers.utils.formatBytes32String("FIRST_CONFIG");
      const firstConfigResult = await createBatchConfiguration(blrContract, {
        configurationId: firstConfigId,
        facets: [
          {
            facetName: "AccessControlFacet",
            address: accessControlResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet").resolverKey!.value,
          },
        ],
      });

      expect(firstConfigResult.success).to.be.true;
      if (firstConfigResult.success) {
        // Verify returned version matches BLR's configuration version
        const blrVersion1 = await blrContract.getLatestVersionByConfiguration(firstConfigId);
        expect(firstConfigResult.data.version).to.equal(blrVersion1.toNumber());
        expect(firstConfigResult.data.version).to.equal(1);
      }

      // Create second configuration
      const secondConfigId = ethers.utils.formatBytes32String("SECOND_CONFIG");
      const secondConfigResult = await createBatchConfiguration(blrContract, {
        configurationId: secondConfigId,
        facets: [
          {
            facetName: "KycFacet",
            address: kycResult.address!,
            resolverKey: atsRegistry.getFacetDefinition("KycFacet").resolverKey!.value,
          },
        ],
      });

      expect(secondConfigResult.success).to.be.true;
      if (secondConfigResult.success) {
        // BUG FIX VERIFICATION: Version must match BLR's per-config version
        const blrVersion2 = await blrContract.getLatestVersionByConfiguration(secondConfigId);
        expect(secondConfigResult.data.version).to.equal(blrVersion2.toNumber());
        // Second config should also start at version 1
        expect(secondConfigResult.data.version).to.equal(1);
      }
    });
  });

  describe("Error Handling", () => {
    // ATS Registry provider for tests
    it("should fail when resolver key lookup fails", async () => {
      // Try to create a configuration without proper resolver key
      // This test now expects an error during facet data preparation
      let thrownError: Error | null = null;
      try {
        await createBatchConfiguration(blrContract, {
          configurationId: ethers.utils.formatBytes32String("EMPTY_CONFIG"),
          facets: [
            {
              facetName: "NonExistentFacet",
              address: "0x1234567890123456789012345678901234567890",
              resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
            },
          ],
        });
      } catch (error) {
        thrownError = error as Error;
      }

      // Should throw during preparation or fail during transaction
      expect(thrownError).to.exist;
    });

    it("should handle empty facet list gracefully", async () => {
      const configResult = await createBatchConfiguration(blrContract, {
        configurationId: ethers.utils.formatBytes32String("NO_FACETS"),
        facets: [],
      });

      // Should fail with empty facet list error
      expect(configResult.success).to.be.false;
      if (!configResult.success) {
        expect(configResult.error).to.equal("EMPTY_FACET_LIST");
      }
    });
  });
});
