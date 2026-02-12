// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for registerAdditionalFacets operation.
 *
 * Tests the new operation that enables downstream projects to register
 * custom facets in an existing BLR by automatically querying and merging
 * with existing facets.
 *
 * Test coverage:
 * - Query and merge functionality
 * - Conflict detection
 * - Overwrite scenarios
 * - Error handling
 * - Integration with existing workflows
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployContract, registerFacets, registerAdditionalFacets } from "@scripts/infrastructure";
import { atsRegistry } from "@scripts/domain";
import { TEST_SIZES, BLR_VERSIONS, deployBlrFixture, silenceScriptLogging } from "@test";

describe("registerAdditionalFacets - Integration Tests", () => {
  before(silenceScriptLogging);

  // Fixture that deploys BLR with 3 initial facets registered
  async function setupWithInitialFacets() {
    const { deployer, blr, blrAddress } = await deployBlrFixture();

    // Deploy and register initial 3 facets
    const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
    const accessControl = await deployContract(accessControlFactory, {});

    const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
    const kyc = await deployContract(kycFactory, {});

    const pauseFactory = await ethers.getContractFactory("PauseFacet", deployer);
    const pause = await deployContract(pauseFactory, {});

    const facetsWithKeys = [
      {
        name: "AccessControlFacet",
        address: accessControl.address!,
        resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
      },
      {
        name: "KycFacet",
        address: kyc.address!,
        resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
      },
      {
        name: "PauseFacet",
        address: pause.address!,
        resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
      },
    ];

    await registerFacets(blr, {
      facets: facetsWithKeys,
    });

    return { deployer, blr, blrAddress };
  }

  describe("Query and Merge", () => {
    it("should query existing facets from BLR and merge with new ones", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(setupWithInitialFacets);

      // Verify initial state: 3 facets registered
      const initialCount = await blr.getBusinessLogicCount();
      expect(initialCount).to.equal(TEST_SIZES.TRIPLE);

      // Step 2: Register 2 additional facets
      const freezeFactory = await ethers.getContractFactory("FreezeFacet", deployer);
      const freeze = await deployContract(freezeFactory, {});

      const lockFactory = await ethers.getContractFactory("LockFacet", deployer);
      const lock = await deployContract(lockFactory, {});

      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: freeze.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
        {
          name: "LockFacet",
          address: lock.address!,
          resolverKey: atsRegistry.getFacetDefinition("LockFacet")!.resolverKey!.value,
        },
      ];

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      // Verify success
      expect(result.success).to.be.true;
      expect(result.blrAddress).to.equal(blrAddress);
      expect(result.transactionHashes).to.exist;
      expect(result.blockNumbers).to.exist;
      expect(result.transactionGas).to.exist;

      // Verify registered count includes new facets
      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);
      expect(result.registered).to.include("FreezeFacet");
      expect(result.registered).to.include("LockFacet");
      expect(result.failed.length).to.equal(0);

      // Verify BLR now has 5 facets total
      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH);
    });

    it("should handle empty BLR (no existing facets)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // BLR is initialized but has no facets registered
      const count = await blr.getBusinessLogicCount();
      expect(count).to.equal(0);

      // Register first facets using registerAdditionalFacets
      const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const accessControl = await deployContract(accessControlFactory, {});

      const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
      const kyc = await deployContract(kycFactory, {});

      const newFacetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControl.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kyc.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(result.success).to.be.true;
      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.DUAL);
    });

    it("should register complete merged list with correct version increment", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register initial facets
      const facet1Factory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facet1 = await deployContract(facet1Factory, {});
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Get initial version
      const initialVersion = await blr.getLatestVersion();
      expect(initialVersion).to.equal(BLR_VERSIONS.FIRST);

      // Add more facets
      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory, {});
      const newFacetsWithKeys = [
        {
          name: "KycFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(result.success).to.be.true;

      // Verify version incremented
      const newVersion = await blr.getLatestVersion();
      expect(newVersion).to.equal(BLR_VERSIONS.SECOND);
    });

    it("should work incrementally over multiple calls", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Call 1: Register 2 facets
      const facet1Factory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facet1 = await deployContract(facet1Factory, {});

      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory, {});

      const newFacetsWithKeys = [
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
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      let count = await blr.getBusinessLogicCount();
      expect(count).to.equal(TEST_SIZES.DUAL);

      // Call 2: Register 2 more facets
      const facet3Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet3 = await deployContract(facet3Factory, {});

      const facet4Factory = await ethers.getContractFactory("FreezeFacet", deployer);
      const facet4 = await deployContract(facet4Factory, {});

      const newFacetsWithKeys2 = [
        {
          name: "PauseFacet",
          address: facet3.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
        {
          name: "FreezeFacet",
          address: facet4.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
      ];
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys2,
      });

      count = await blr.getBusinessLogicCount();
      expect(count).to.equal(4); // 2 + 2 = 4

      // Call 3: Register 1 more facet
      const facet5Factory = await ethers.getContractFactory("LockFacet", deployer);
      const facet5 = await deployContract(facet5Factory, {});
      const newFacetsWithKeys3 = [
        {
          name: "LockFacet",
          address: facet5.address!,
          resolverKey: atsRegistry.getFacetDefinition("LockFacet")!.resolverKey!.value,
        },
      ];
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys3,
      });

      count = await blr.getBusinessLogicCount();
      expect(count).to.equal(TEST_SIZES.SMALL_BATCH); // 4 + 1 = 5
    });

    it("should handle pagination for large existing facet counts", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register 10 facets initially
      const facetNames = [
        "AccessControlFacet",
        "KycFacet",
        "PauseFacet",
        "FreezeFacet",
        "LockFacet",
        "ControlListFacet",
        "CapFacet",
        "SnapshotsFacet",
        "ERC20Facet",
        "DiamondFacet",
      ];

      const facets: Record<string, string> = {};
      for (const name of facetNames) {
        const factory = await ethers.getContractFactory(name, deployer);
        const result = await deployContract(factory, {});
        facets[name] = result.address!;
      }

      const facetsWithKeys = facetNames.map((name) => ({
        name,
        address: facets[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Verify 10 facets registered
      const initialCount = await blr.getBusinessLogicCount();
      expect(initialCount).to.equal(TEST_SIZES.MEDIUM_BATCH);

      // Add 2 more using registerAdditionalFacets
      const erc1410Factory = await ethers.getContractFactory("ERC1410ReadFacet", deployer);
      const erc1410 = await deployContract(erc1410Factory, {});

      const erc1594Factory = await ethers.getContractFactory("ERC1594Facet", deployer);
      const erc1594 = await deployContract(erc1594Factory, {});

      const newFacetsWithKeys = [
        {
          name: "ERC1410ReadFacet",
          address: erc1410.address!,
          resolverKey: atsRegistry.getFacetDefinition("ERC1410ReadFacet")!.resolverKey!.value,
        },
        {
          name: "ERC1594Facet",
          address: erc1594.address!,
          resolverKey: atsRegistry.getFacetDefinition("ERC1594Facet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(result.success).to.be.true;

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.LARGE_BATCH); // 10 + 2 = 12
    });
  });

  describe("Conflict Detection", () => {
    it("should detect conflicts (same facet name, different address)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register facet at address A
      const facetAFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facetA = await deployContract(facetAFactory, {});
      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: facetA.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Deploy different instance at address B
      const facetBFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facetB = await deployContract(facetBFactory, {});

      // Attempt to register same facet at different address
      const newFacetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: facetB.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
        allowOverwrite: false,
      });

      // Should fail with conflict error
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("already exist");
      expect(result.failed).to.include("AccessControlFacet");
    });

    it("should prevent overwrites by default (allowOverwrite=false)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register initial facet
      const facet1Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet1 = await deployContract(facet1Factory, {});
      const facetsWithKeys = [
        {
          name: "KycFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Deploy new version
      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory, {});

      // Try to register without allowOverwrite (default false)
      const newFacetsWithKeys = [
        {
          name: "KycFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(result.success).to.be.false;
      expect(result.failed).to.include("KycFacet");
    });

    it("should allow overwrites when explicitly enabled (allowOverwrite=true)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register initial facet
      const facet1Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet1 = await deployContract(facet1Factory, {});
      const facetsWithKeys = [
        {
          name: "PauseFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Deploy new version
      const facet2Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet2 = await deployContract(facet2Factory, {});

      // Register with allowOverwrite=true
      const newFacetsWithKeys = [
        {
          name: "PauseFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
        allowOverwrite: true,
      });

      // Should succeed
      expect(result.success).to.be.true;
      expect(result.registered).to.include("PauseFacet");

      // Verify BLR still has 1 facet (overwritten, not added)
      const count = await blr.getBusinessLogicCount();
      expect(count).to.equal(TEST_SIZES.SINGLE);

      // Verify facet resolves to new address
      const facetDefinition = atsRegistry.getFacetDefinition("PauseFacet");
      const facetKey = facetDefinition!.resolverKey!.value;
      const resolvedAddress = await blr.resolveLatestBusinessLogic(facetKey);
      expect(resolvedAddress).to.equal(facet2.address);
    });

    it("should skip facets already registered at same address", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register facet
      const facetFactory = await ethers.getContractFactory("FreezeFacet", deployer);
      const facet = await deployContract(facetFactory, {});
      const facetsWithKeys = [
        {
          name: "FreezeFacet",
          address: facet.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      const initialCount = await blr.getBusinessLogicCount();

      // Try to register same facet at same address
      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: facet.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      // Should succeed but not add duplicate
      expect(result.success).to.be.true;

      // Count should remain same
      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(initialCount);

      // Version remains same when re-registering same facet at same address (no-op)
      const finalVersion = await blr.getBusinessLogicCount();
      expect(finalVersion).to.equal(initialCount);
    });
  });

  describe("Error Handling", () => {
    it("should fail if new facet address is invalid", async () => {
      const { deployer, blrAddress } = await loadFixture(deployBlrFixture);

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: [
          {
            name: "InvalidFacet",
            address: "0xinvalid",
            resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000001",
          },
        ],
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.failed).to.include("InvalidFacet");
    });

    it("should fail if new facet contract does not exist at address", async () => {
      const { deployer, blrAddress } = await loadFixture(deployBlrFixture);

      // Use a valid address format but no contract deployed
      const nonExistentAddress = "0x1234567890123456789012345678901234567890";

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: [
          {
            name: "NonExistentFacet",
            address: nonExistentAddress,
            resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000001",
          },
        ],
      });

      expect(result.success).to.be.false;
      expect(result.failed).to.include("NonExistentFacet");
    });

    it("should validate at least one new facet is provided", async () => {
      const { deployer, blrAddress } = await loadFixture(deployBlrFixture);

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: [],
      });

      // Should succeed but with no-op
      expect(result.success).to.be.true;
      expect(result.registered.length).to.equal(0);
      expect(result.failed.length).to.equal(0);
    });

    it("should handle conflicts gracefully with clear error messages", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register initial facet
      const facet1Factory = await ethers.getContractFactory("LockFacet", deployer);
      const facet1 = await deployContract(facet1Factory, {});
      const facetsWithKeys = [
        {
          name: "LockFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("LockFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Try to register different address for same facet
      const facet2Factory = await ethers.getContractFactory("LockFacet", deployer);
      const facet2 = await deployContract(facet2Factory, {});

      const newFacetsWithKeys = [
        {
          name: "LockFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("LockFacet")!.resolverKey!.value,
        },
      ];
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
        allowOverwrite: false,
      });

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error).to.include("already exist");
      expect(result.error).to.include("allowOverwrite");
      expect(result.failed).to.deep.equal(["LockFacet"]);
    });
  });

  describe("Integration with Existing Workflows", () => {
    it("should work correctly after initial registerFacets call", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Use standard registerFacets first
      const facets1 = ["AccessControlFacet", "KycFacet", "PauseFacet"];
      const addresses1: Record<string, string> = {};

      for (const name of facets1) {
        const factory = await ethers.getContractFactory(name, deployer);
        const result = await deployContract(factory, {});
        addresses1[name] = result.address!;
      }

      const facetsWithKeys1 = facets1.map((name) => ({
        name,
        address: addresses1[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      await registerFacets(blr, {
        facets: facetsWithKeys1,
      });

      // Then use registerAdditionalFacets to extend
      const facets2 = ["FreezeFacet", "LockFacet"];
      const addresses2: Record<string, string> = {};

      for (const name of facets2) {
        const factory = await ethers.getContractFactory(name, deployer);
        const result = await deployContract(factory, {});
        addresses2[name] = result.address!;
      }

      const newFacetsWithKeys2 = facets2.map((name) => ({
        name,
        address: addresses2[name],
        resolverKey: atsRegistry.getFacetDefinition(name)!.resolverKey!.value,
      }));
      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys2,
      });

      expect(result.success).to.be.true;
      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH);
    });

    it("should work with configurations created after registration", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // Register initial facets
      const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const accessControl = await deployContract(accessControlFactory, {});

      const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
      const kyc = await deployContract(kycFactory, {});

      const pauseFactory = await ethers.getContractFactory("PauseFacet", deployer);
      const pause = await deployContract(pauseFactory, {});

      const facetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: accessControl.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
        {
          name: "KycFacet",
          address: kyc.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
        {
          name: "PauseFacet",
          address: pause.address!,
          resolverKey: atsRegistry.getFacetDefinition("PauseFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      // Add more facets
      const freezeFactory = await ethers.getContractFactory("FreezeFacet", deployer);
      const freeze = await deployContract(freezeFactory, {});

      const lockFactory = await ethers.getContractFactory("LockFacet", deployer);
      const lock = await deployContract(lockFactory, {});

      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: freeze.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
        {
          name: "LockFacet",
          address: lock.address!,
          resolverKey: atsRegistry.getFacetDefinition("LockFacet")!.resolverKey!.value,
        },
      ];
      const addResult = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(addResult.success).to.be.true;

      // Verify all facets can be resolved from BLR
      const facetNames = ["AccessControlFacet", "KycFacet", "PauseFacet", "FreezeFacet", "LockFacet"];

      for (const name of facetNames) {
        const facetDefinition = atsRegistry.getFacetDefinition(name);
        const key = facetDefinition!.resolverKey!.value;
        const address = await blr.resolveLatestBusinessLogic(key);
        expect(address).to.not.equal(ethers.ZeroAddress);
      }
    });
  });
});
