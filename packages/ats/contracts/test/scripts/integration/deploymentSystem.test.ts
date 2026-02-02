// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for Phase 1 deployment system.
 *
 * Tests the core deployment operations and utilities to ensure they work
 * correctly together in realistic scenarios.
 *
 * These tests verify:
 * - Atomic operations (deployContract, deployProxy, etc.)
 * - Utilities (validation, naming, registry)
 * - Basic deployment workflows
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";

// Infrastructure layer
import {
  deployContract,
  deployProxy,
  registerFacets,
  deployBlr,
  deployProxyAdmin,
  deployFacets,
  getTimeTravelVariant,
  hasTimeTravelVariant,
  resolveContractName,
  getBaseContractName,
  isTimeTravelVariant,
  validateAddress,
  validateBytes32,
} from "@scripts/infrastructure";

// Domain layer
import {
  deployFactory,
  EQUITY_CONFIG_ID,
  BOND_CONFIG_ID,
  FACET_REGISTRY,
  FACET_REGISTRY_COUNT,
  atsRegistry,
} from "@scripts/domain";

// Test helpers
import { TEST_SIZES, BLR_VERSIONS, silenceScriptLogging } from "@test";

// Contract types
import {
  ProxyAdmin__factory,
  AccessControlFacet__factory,
  AccessControlFacetTimeTravel__factory,
  BusinessLogicResolver__factory,
  KycFacet__factory,
  Factory__factory,
  PauseFacet__factory,
  ProxyAdmin,
} from "@contract-types";

describe("Phase 1 Deployment System - Integration Tests", () => {
  let deployer: Signer;
  let user: Signer;

  before(silenceScriptLogging);

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
  });

  describe("Utilities - Naming", () => {
    it("should generate TimeTravel variant names correctly", () => {
      expect(getTimeTravelVariant("AccessControlFacet")).to.equal("AccessControlFacetTimeTravel");
      expect(getTimeTravelVariant("KycFacet")).to.equal("KycFacetTimeTravel");
      expect(getTimeTravelVariant("ERC20Facet")).to.equal("ERC20FacetTimeTravel");
    });

    it("should detect TimeTravel variant availability from registry", () => {
      expect(hasTimeTravelVariant("AccessControlFacet")).to.be.true;
      expect(hasTimeTravelVariant("KycFacet")).to.be.true;
      expect(hasTimeTravelVariant("PauseFacet")).to.be.true;
    });

    it("should resolve contract names based on useTimeTravel flag", () => {
      // Standard mode
      expect(resolveContractName("AccessControlFacet", false)).to.equal("AccessControlFacet");

      // TimeTravel mode with variant available
      expect(resolveContractName("AccessControlFacet", true)).to.equal("AccessControlFacetTimeTravel");

      // TimeTravel mode but no variant (should return base name)
      expect(resolveContractName("ProxyAdmin", true)).to.equal("ProxyAdmin");
    });

    it("should extract base contract name from TimeTravel variant", () => {
      expect(getBaseContractName("AccessControlFacetTimeTravel")).to.equal("AccessControlFacet");
      expect(getBaseContractName("KycFacetTimeTravel")).to.equal("KycFacet");
      expect(getBaseContractName("AccessControlFacet")).to.equal("AccessControlFacet");
    });

    it("should detect if contract name is TimeTravel variant", () => {
      expect(isTimeTravelVariant("AccessControlFacetTimeTravel")).to.be.true;
      expect(isTimeTravelVariant("KycFacetTimeTravel")).to.be.true;
      expect(isTimeTravelVariant("AccessControlFacet")).to.be.false;
      expect(isTimeTravelVariant("ProxyAdmin")).to.be.false;
    });
  });

  describe("Utilities - Validation", () => {
    it("should validate correct Ethereum addresses", async () => {
      const deployerAddress = await deployer.getAddress();
      const userAddress = await user.getAddress();

      expect(() => validateAddress(deployerAddress, "deployer")).to.not.throw();
      expect(() => validateAddress(userAddress, "user")).to.not.throw();
      expect(() => validateAddress(ethers.constants.AddressZero, "zero address")).to.not.throw();
    });

    it("should reject invalid addresses", () => {
      expect(() => validateAddress("0xinvalid", "test")).to.throw();
      expect(() => validateAddress("not-an-address", "test")).to.throw();
      expect(() => validateAddress("0x123", "test")).to.throw();
      expect(() => validateAddress("", "test")).to.throw();
    });

    it("should validate bytes32 values", () => {
      expect(() => validateBytes32(EQUITY_CONFIG_ID, "config ID")).to.not.throw();
      expect(() => validateBytes32(BOND_CONFIG_ID, "config ID")).to.not.throw();
    });

    it("should reject invalid bytes32 values", () => {
      expect(() => validateBytes32("0xinvalid", "config ID")).to.throw();
      expect(() => validateBytes32("not-bytes32", "config ID")).to.throw();
    });
  });

  describe("Registry", () => {
    it("should contain expected Phase 1 facets", () => {
      expect(FACET_REGISTRY).to.have.property("AccessControlFacet");
      expect(FACET_REGISTRY).to.have.property("KycFacet");
      expect(FACET_REGISTRY).to.have.property("PauseFacet");
      expect(FACET_REGISTRY).to.have.property("ERC20Facet");
      expect(FACET_REGISTRY).to.have.property("ControlListFacet");
    });

    it("should have correct facet metadata", () => {
      const accessControl = atsRegistry.getFacetDefinition("AccessControlFacet")!;
      expect(accessControl).to.exist;
      expect(accessControl.name).to.equal("AccessControlFacet");
      // Description is optional (only present if natspec @notice or @title exists)

      const kyc = atsRegistry.getFacetDefinition("KycFacet")!;
      expect(kyc).to.exist;
      expect(kyc.name).to.equal("KycFacet");
      // Description is optional (only present if natspec @notice or @title exists)
    });

    it("should return all facets", () => {
      const allFacets = atsRegistry.getAllFacets();
      expect(allFacets.length).to.equal(FACET_REGISTRY_COUNT);

      // Verify each facet has required fields
      allFacets.forEach((facet) => {
        expect(facet.name).to.exist;
        // Description is optional - only present if facet has natspec comments
      });
    });

    it("should get specific facet by name", () => {
      const accessControl = atsRegistry.getFacetDefinition("AccessControlFacet");
      expect(accessControl).to.exist;
      expect(accessControl!.name).to.equal("AccessControlFacet");

      const nonExistent = atsRegistry.getFacetDefinition("NonExistentFacet");
      expect(nonExistent).to.be.undefined;
    });
  });

  describe("Atomic Operations - deployContract", () => {
    it("should deploy a simple contract successfully", async () => {
      const factory = new ProxyAdmin__factory(deployer);
      const result = await deployContract(factory, {});

      expect(result.success).to.be.true;
      expect(result.contract).to.exist;
      expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.transactionHash).to.exist;
      expect(result.blockNumber).to.be.greaterThan(0);
      expect(result.gasUsed).to.be.greaterThan(0);
      expect(result.error).to.not.exist;
    });

    it("should deploy TimeTravel variant when specified", async () => {
      const factory = new AccessControlFacetTimeTravel__factory(deployer);
      const result = await deployContract(factory, {});

      expect(result.success).to.be.true;
      expect(result.contract).to.exist;
      expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should deploy regular facet successfully", async () => {
      const factory = new AccessControlFacet__factory(deployer);
      const result = await deployContract(factory, {});

      expect(result.success).to.be.true;
      expect(result.contract).to.exist;
    });
  });

  describe("Atomic Operations - deployProxy", () => {
    it("should deploy complete proxy setup (implementation, proxy, proxyAdmin)", async () => {
      const implementationFactory = new BusinessLogicResolver__factory(deployer);
      const result = await deployProxy(deployer, {
        implementationFactory,
      });

      // Check implementation
      expect(result.implementation).to.exist;
      expect(result.implementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

      // Check proxy
      expect(result.proxy).to.exist;
      expect(result.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

      // Check ProxyAdmin
      expect(result.proxyAdmin).to.exist;
      expect(result.proxyAdminAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

      // Check receipts
      expect(result.receipts.implementation).to.exist;
      expect(result.receipts.proxy).to.exist;
      expect(result.receipts.proxyAdmin).to.exist;

      // Verify addresses are different
      expect(result.implementationAddress).to.not.equal(result.proxyAddress);
      expect(result.proxyAddress).to.not.equal(result.proxyAdminAddress);
    });

    it("should reuse existing ProxyAdmin when provided", async () => {
      // Deploy first proxy (creates ProxyAdmin)
      const implementationFactory1 = new BusinessLogicResolver__factory(deployer);
      const result1 = await deployProxy(deployer, {
        implementationFactory: implementationFactory1,
      });

      // Deploy second proxy reusing ProxyAdmin
      const implementationFactory2 = new Factory__factory(deployer);
      const result2 = await deployProxy(deployer, {
        implementationFactory: implementationFactory2,
        existingProxyAdmin: result1.proxyAdmin,
      });

      expect(result2.proxyAdminAddress).to.equal(result1.proxyAdminAddress);
      expect(result2.receipts.proxyAdmin).to.not.exist;
    });
  });

  describe("Atomic Operations - registerFacets", () => {
    it("should register multiple facets in BLR", async () => {
      // Deploy BLR
      const implementationFactory = new BusinessLogicResolver__factory(deployer);
      const blrResult = await deployProxy(deployer, {
        implementationFactory,
      });

      // Initialize BLR
      const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
      await blr.initialize_BusinessLogicResolver();

      // Deploy facets
      const facet1Factory = new AccessControlFacet__factory(deployer);
      const facet1 = await deployContract(facet1Factory, {});

      const facet2Factory = new KycFacet__factory(deployer);
      const facet2 = await deployContract(facet2Factory, {});

      // Register facets
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.blrAddress).to.equal(blrResult.proxyAddress);
      expect(registerResult.registered.length).to.equal(TEST_SIZES.DUAL);
      expect(registerResult.transactionHashes).to.exist;
    });

    it("should register single facet", async () => {
      const implementationFactory = new BusinessLogicResolver__factory(deployer);
      const blrResult = await deployProxy(deployer, {
        implementationFactory,
      });

      // Initialize BLR
      const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
      await blr.initialize_BusinessLogicResolver();

      const facetFactory = new PauseFacet__factory(deployer);
      const facetResult = await deployContract(facetFactory, {});

      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: facetResult.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      const registerResult = await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.SINGLE);
      expect(registerResult.registered[0]).to.equal("PauseFacet");
    });
  });

  describe("Domain Operations", () => {
    it("should deploy BLR with proxy and initialization", async () => {
      const result = await deployBlr(deployer, {});

      expect(result.success).to.be.true;
      expect(result.blrAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.implementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(result.proxyAdminAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

      // Verify BLR is initialized
      const blr = BusinessLogicResolver__factory.connect(result.blrAddress, deployer);

      // Should not revert when calling initialized functions
      const version = await blr.getLatestVersion();
      expect(version).to.equal(BLR_VERSIONS.INITIAL);
    });

    it("should deploy ProxyAdmin", async () => {
      const proxyAdmin = await deployProxyAdmin(deployer);

      expect(proxyAdmin.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(proxyAdmin.deployTransaction).to.exist;
      expect(proxyAdmin.deployTransaction.hash).to.exist;
      expect(proxyAdmin.deployTransaction.blockNumber).to.be.greaterThan(0);
    });

    it("should deploy Factory with BLR reference", async () => {
      // First deploy BLR
      const blrResult = await deployBlr(deployer, {});
      expect(blrResult.success).to.be.true;

      // Deploy Factory with BLR reference
      const factoryResult = await deployFactory(deployer, {
        blrAddress: blrResult.blrAddress,
        existingProxyAdmin: blrResult.proxyResult.proxyAdmin,
      });

      expect(factoryResult.success).to.be.true;
      expect(factoryResult.factoryAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(factoryResult.implementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(factoryResult.proxyAdminAddress).to.equal(blrResult.proxyAdminAddress);

      // Verify Factory deployment was successful (Factory doesn't have a getter for BLR address)
      expect(factoryResult.factoryAddress).to.not.equal(ethers.constants.AddressZero);
    });

    it("should deploy multiple facets in batch", async () => {
      const facetNames = ["AccessControlFacet", "KycFacet", "PauseFacet"];

      // Create factories for each facet
      const facetFactories: Record<string, any> = {};
      for (const name of facetNames) {
        facetFactories[name] = await ethers.getContractFactory(name, deployer);
      }

      const result = await deployFacets(facetFactories, {
        confirmations: 0, // No confirmations needed for Hardhat
        enableRetry: false, // No retry needed for local network
        verifyDeployment: false, // No verification needed for tests
      });

      expect(result.success).to.be.true;
      expect(result.deployed.size).to.equal(TEST_SIZES.TRIPLE);
      expect(result.failed.size).to.equal(0);
      expect(result.skipped.size).to.equal(0);

      // Verify all facets were deployed
      facetNames.forEach((name) => {
        expect(result.deployed.has(name)).to.be.true;
        const deploymentResult = result.deployed.get(name)!;
        expect(deploymentResult.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });

  describe("Complete Workflow", () => {
    it("should execute basic deployment pipeline", async () => {
      // Step 1: Deploy ProxyAdmin
      const proxyAdminFactory = new ProxyAdmin__factory(deployer);
      const proxyAdminResult = await deployContract(proxyAdminFactory, {});
      expect(proxyAdminResult.success).to.be.true;

      // Step 2: Deploy facets
      const facets: Array<{ name: string; factory: any }> = [
        {
          name: "AccessControlFacet",
          factory: new AccessControlFacet__factory(deployer),
        },
        { name: "KycFacet", factory: new KycFacet__factory(deployer) },
        {
          name: "PauseFacet",
          factory: new PauseFacet__factory(deployer),
        },
      ];
      const facetResults: Record<string, string> = {};

      for (const { name, factory } of facets) {
        const result = await deployContract(factory, {});
        expect(result.success).to.be.true;
        facetResults[name] = result.address!;
      }

      // Step 3: Deploy BLR with proxy
      const blrImplementationFactory = new BusinessLogicResolver__factory(deployer);
      const blrResult = await deployProxy(deployer, {
        implementationFactory: blrImplementationFactory,
        existingProxyAdmin: proxyAdminResult.contract as any,
      });
      expect(blrResult.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
      expect(blrResult.proxyAdminAddress).to.equal(proxyAdminResult.address);

      // Initialize BLR
      const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
      await blr.initialize_BusinessLogicResolver();

      // Step 4: Register facets in BLR
      const facetsWithKeys = facets.map(({ name }) => ({
        name,
        address: facetResults[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      const registerResult = await registerFacets(blr, {
        facets: facetsWithKeys,
      });
      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.TRIPLE);

      // Step 5: Deploy Factory
      const factoryImplementationFactory = new Factory__factory(deployer);
      const factoryResult = await deployProxy(deployer, {
        implementationFactory: factoryImplementationFactory,
        existingProxyAdmin: proxyAdminResult.contract as ProxyAdmin,
      });
      expect(factoryResult.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle TimeTravel deployment workflow", async () => {
      // Deploy all facets in TimeTravel mode
      const facets = [
        {
          name: "AccessControlFacet",
          factory: new AccessControlFacetTimeTravel__factory(deployer),
        },
        { name: "KycFacet", factory: new KycFacet__factory(deployer) }, // Note: KycFacet doesn't have TimeTravel variant
      ];
      const facetResults: Record<string, string> = {};

      for (const { name, factory } of facets) {
        const result = await deployContract(factory, {});
        expect(result.success).to.be.true;
        facetResults[name] = result.address!;
      }

      // Deploy BLR
      const blrImplementationFactory = new BusinessLogicResolver__factory(deployer);
      const blrResult = await deployProxy(deployer, {
        implementationFactory: blrImplementationFactory,
      });

      // Initialize BLR
      const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
      await blr.initialize_BusinessLogicResolver();

      // Register TimeTravel facets (using base names as keys)
      const facetsWithKeys = facets.map(({ name }) => ({
        name,
        address: facetResults[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      const registerResult = await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(TEST_SIZES.DUAL);
    });
  });

  describe("Error Handling", () => {
    it("should validate addresses before operations", () => {
      expect(() => validateAddress("invalid", "test")).to.throw();
      expect(() => validateAddress("0x123", "test")).to.throw();
      expect(() => validateAddress("", "test")).to.throw();
    });

    it("should handle empty facet registration", async () => {
      const implementationFactory = new BusinessLogicResolver__factory(deployer);
      const blrResult = await deployProxy(deployer, {
        implementationFactory,
      });

      // Initialize BLR
      const blr = BusinessLogicResolver__factory.connect(blrResult.proxyAddress, deployer);
      await blr.initialize_BusinessLogicResolver();

      const registerResult = await registerFacets(blr, {
        facets: [],
      });

      expect(registerResult.success).to.be.true;
      expect(registerResult.registered.length).to.equal(0); // Empty registration
    });
  });
});
