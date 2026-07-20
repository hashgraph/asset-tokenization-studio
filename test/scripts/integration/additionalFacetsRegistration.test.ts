// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for registerAdditionalFacets: querying and merging with
 * the facets already in the BLR, conflict detection and allowOverwrite.
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployContract, registerFacets, registerAdditionalFacets } from "@lib/operations";
import { atsRegistry, isLibraryDependentFacet, getFacetRequiredLibraries, getLibLinks } from "@lib/domain";
import {
  deployOrchestratorLibraries,
  setOrchestratorLibraryAddresses,
  hasOrchestratorLibraryAddresses,
} from "@lib/domain";
import { TEST_SIZES, BLR_VERSIONS, deployBlrFixture } from "@test";

describe("registerAdditionalFacets - Integration Tests", () => {
  // Fixture that deploys BLR with 3 initial facets registered
  async function setupWithInitialFacets() {
    const { deployer, blr, blrAddress } = await deployBlrFixture();

    // Deploy and register initial 3 facets
    const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
    const accessControl = await deployContract(accessControlFactory);

    const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
    const kyc = await deployContract(kycFactory);

    const pauseFactory = await ethers.getContractFactory("PauseFacet", deployer);
    const pause = await deployContract(pauseFactory);

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

      const initialCount = await blr.getBusinessLogicCount();
      expect(initialCount).to.equal(TEST_SIZES.TRIPLE);

      if (!hasOrchestratorLibraryAddresses()) {
        setOrchestratorLibraryAddresses(await deployOrchestratorLibraries(deployer));
      }
      const freezeFactory = await ethers.getContractFactory("FreezeFacet", {
        signer: deployer,
        libraries: getLibLinks(...getFacetRequiredLibraries("FreezeFacet")),
      });
      const freeze = await deployContract(freezeFactory as any);

      const lockFactory = await ethers.getContractFactory("CapFacet", deployer);
      const lock = await deployContract(lockFactory);

      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: freeze.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
        {
          name: "CapFacet",
          address: lock.address!,
          resolverKey: atsRegistry.getFacetDefinition("CapFacet")!.resolverKey!.value,
        },
      ];

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      expect(result.blrAddress).to.equal(blrAddress);

      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);
      expect(result.registered).to.include("FreezeFacet");
      expect(result.registered).to.include("CapFacet");
      expect(result.failed.length).to.equal(0);

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH);
    });

    it("should handle empty BLR (no existing facets)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      // BLR is initialized but has no facets registered
      const count = await blr.getBusinessLogicCount();
      expect(count).to.equal(0);

      const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const accessControl = await deployContract(accessControlFactory);

      const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
      const kyc = await deployContract(kycFactory);

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

      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.DUAL);
    });

    it("should register complete merged list with correct version increment", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facet1Factory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facet1 = await deployContract(facet1Factory);
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

      const initialVersion = await blr.getLatestVersion(facetsWithKeys[0].resolverKey);
      expect(initialVersion).to.equal(BLR_VERSIONS.FIRST);

      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory);
      const newFacetsWithKeys = [
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

      const newVersion = await blr.getLatestVersion(newFacetsWithKeys[0].resolverKey);
      expect(newVersion).to.equal(BLR_VERSIONS.FIRST);
    });

    it("should work incrementally over multiple calls", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facet1Factory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facet1 = await deployContract(facet1Factory);

      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory);

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

      const facet3Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet3 = await deployContract(facet3Factory);

      if (!hasOrchestratorLibraryAddresses()) {
        setOrchestratorLibraryAddresses(await deployOrchestratorLibraries(deployer));
      }
      const facet4Factory = await ethers.getContractFactory("FreezeFacet", {
        signer: deployer,
        libraries: getLibLinks(...getFacetRequiredLibraries("FreezeFacet")),
      });
      const facet4 = await deployContract(facet4Factory as any);

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

      const facet5Factory = await ethers.getContractFactory("CapFacet", deployer);
      const facet5 = await deployContract(facet5Factory);
      const newFacetsWithKeys3 = [
        {
          name: "CapFacet",
          address: facet5.address!,
          resolverKey: atsRegistry.getFacetDefinition("CapFacet")!.resolverKey!.value,
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

      const facetNames = [
        "AccessControlFacet",
        "KycFacet",
        "PauseFacet",
        "FreezeFacet",
        "CapFacet",
        "ControlListFacet",
        "SnapshotsFacet",
        "TransferFacet",
        "DiamondFacet",
        "AdjustBalancesFacet",
      ];

      // Deploy orchestrator libraries if any facet needs them
      const needsLibraries = facetNames.some((name) => isLibraryDependentFacet(name));
      if (needsLibraries && !hasOrchestratorLibraryAddresses()) {
        const libAddresses = await deployOrchestratorLibraries(deployer);
        setOrchestratorLibraryAddresses(libAddresses);
      }

      const facets: Record<string, string> = {};
      for (const name of facetNames) {
        const requiredLibs = getFacetRequiredLibraries(name);
        const libLinks = requiredLibs.length > 0 ? getLibLinks(...requiredLibs) : undefined;
        const factory = await ethers.getContractFactory(name, {
          signer: deployer,
          libraries: libLinks,
        });
        const result = await deployContract(factory as any);
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

      const initialCount = await blr.getBusinessLogicCount();
      expect(initialCount).to.equal(TEST_SIZES.MEDIUM_BATCH);

      const partitionsFactory = await ethers.getContractFactory("PartitionsFacet", deployer);
      const partitions = await deployContract(partitionsFactory);

      // MintFacet — requires TokenCoreOps library link
      if (!hasOrchestratorLibraryAddresses()) {
        const libAddresses = await deployOrchestratorLibraries(deployer);
        setOrchestratorLibraryAddresses(libAddresses);
      }
      const mintLibLinks = getLibLinks(...getFacetRequiredLibraries("MintFacet"));
      const mintFactory = await ethers.getContractFactory("MintFacet", {
        signer: deployer,
        libraries: mintLibLinks,
      });
      const mint = await deployContract(mintFactory as any);

      const newFacetsWithKeys = [
        {
          name: "PartitionsFacet",
          address: partitions.address!,
          resolverKey: atsRegistry.getFacetDefinition("PartitionsFacet")!.resolverKey!.value,
        },
        {
          name: "MintFacet",
          address: mint.address!,
          resolverKey: atsRegistry.getFacetDefinition("MintFacet")!.resolverKey!.value,
        },
      ];
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.LARGE_BATCH); // 10 + 2 = 12
    });
  });

  describe("Conflict Detection", () => {
    it("should detect conflicts (same facet name, different address)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facetAFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facetA = await deployContract(facetAFactory);
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

      const facetBFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const facetB = await deployContract(facetBFactory);

      const newFacetsWithKeys = [
        {
          name: "AccessControlFacet",
          address: facetB.address!,
          resolverKey: atsRegistry.getFacetDefinition("AccessControlFacet")!.resolverKey!.value,
        },
      ];
      await expect(
        registerAdditionalFacets(deployer, {
          blrAddress,
          newFacets: newFacetsWithKeys,
          allowOverwrite: false,
        }),
      ).to.be.rejectedWith(/already exist.*AccessControlFacet/);
    });

    it("should prevent overwrites by default (allowOverwrite=false)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facet1Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet1 = await deployContract(facet1Factory);
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

      const facet2Factory = await ethers.getContractFactory("KycFacet", deployer);
      const facet2 = await deployContract(facet2Factory);

      const newFacetsWithKeys = [
        {
          name: "KycFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("KycFacet")!.resolverKey!.value,
        },
      ];
      await expect(
        registerAdditionalFacets(deployer, {
          blrAddress,
          newFacets: newFacetsWithKeys,
        }),
      ).to.be.rejectedWith(/already exist.*KycFacet/);
    });

    it("should allow overwrites when explicitly enabled (allowOverwrite=true)", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facet1Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet1 = await deployContract(facet1Factory);
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

      const facet2Factory = await ethers.getContractFactory("PauseFacet", deployer);
      const facet2 = await deployContract(facet2Factory);

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

      expect(result.registered).to.include("PauseFacet");

      // Verify BLR still has 1 facet (overwritten, not added)
      const count = await blr.getBusinessLogicCount();
      expect(count).to.equal(TEST_SIZES.SINGLE);

      const facetDefinition = atsRegistry.getFacetDefinition("PauseFacet");
      const facetKey = facetDefinition!.resolverKey!.value;
      const resolvedAddress = await blr.resolveLatestBusinessLogic(facetKey);
      expect(resolvedAddress).to.equal(facet2.address);
    });

    it("should skip facets already registered at same address", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      if (!hasOrchestratorLibraryAddresses()) {
        setOrchestratorLibraryAddresses(await deployOrchestratorLibraries(deployer));
      }
      const facetFactory = await ethers.getContractFactory("FreezeFacet", {
        signer: deployer,
        libraries: getLibLinks(...getFacetRequiredLibraries("FreezeFacet")),
      });
      const facet = await deployContract(facetFactory as any);
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

      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: facet.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
      ];
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

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

      await expect(
        registerAdditionalFacets(deployer, {
          blrAddress,
          newFacets: [
            {
              name: "InvalidFacet",
              address: "0xinvalid",
              resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000001",
            },
          ],
        }),
      ).to.be.rejectedWith(/All new facets failed validation.*InvalidFacet/);
    });

    it("should fail if new facet contract does not exist at address", async () => {
      const { deployer, blrAddress } = await loadFixture(deployBlrFixture);

      // Use a valid address format but no contract deployed
      const nonExistentAddress = "0x1234567890123456789012345678901234567890";

      await expect(
        registerAdditionalFacets(deployer, {
          blrAddress,
          newFacets: [
            {
              name: "NonExistentFacet",
              address: nonExistentAddress,
              resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000001",
            },
          ],
        }),
      ).to.be.rejectedWith(/All new facets failed validation.*NonExistentFacet/);
    });

    it("should validate at least one new facet is provided", async () => {
      const { deployer, blrAddress } = await loadFixture(deployBlrFixture);

      const result = await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: [],
      });

      // Should succeed but with no-op
      expect(result.registered.length).to.equal(0);
      expect(result.failed.length).to.equal(0);
    });

    it("should handle conflicts gracefully with clear error messages", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const facet1Factory = await ethers.getContractFactory("CapFacet", deployer);
      const facet1 = await deployContract(facet1Factory);
      const facetsWithKeys = [
        {
          name: "CapFacet",
          address: facet1.address!,
          resolverKey: atsRegistry.getFacetDefinition("CapFacet")!.resolverKey!.value,
        },
      ];
      await registerFacets(blr, {
        facets: facetsWithKeys,
      });

      const facet2Factory = await ethers.getContractFactory("CapFacet", deployer);
      const facet2 = await deployContract(facet2Factory);

      const newFacetsWithKeys = [
        {
          name: "CapFacet",
          address: facet2.address!,
          resolverKey: atsRegistry.getFacetDefinition("CapFacet")!.resolverKey!.value,
        },
      ];
      await expect(
        registerAdditionalFacets(deployer, {
          blrAddress,
          newFacets: newFacetsWithKeys,
          allowOverwrite: false,
        }),
      ).to.be.rejectedWith(/already exist.*CapFacet.*allowOverwrite/);
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
        const result = await deployContract(factory);
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
      const facets2 = ["FreezeFacet", "CapFacet"];
      const addresses2: Record<string, string> = {};

      for (const name of facets2) {
        const requiredLibs = getFacetRequiredLibraries(name);
        if (requiredLibs.length > 0 && !hasOrchestratorLibraryAddresses()) {
          setOrchestratorLibraryAddresses(await deployOrchestratorLibraries(deployer));
        }
        const factory = await ethers.getContractFactory(name, {
          signer: deployer,
          libraries: requiredLibs.length > 0 ? getLibLinks(...requiredLibs) : undefined,
        });
        const result = await deployContract(factory as any);
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

      expect(result.registered.length).to.equal(TEST_SIZES.DUAL);

      const finalCount = await blr.getBusinessLogicCount();
      expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH);
    });

    it("should work with configurations created after registration", async () => {
      const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);

      const accessControlFactory = await ethers.getContractFactory("AccessControlFacet", deployer);
      const accessControl = await deployContract(accessControlFactory);

      const kycFactory = await ethers.getContractFactory("KycFacet", deployer);
      const kyc = await deployContract(kycFactory);

      const pauseFactory = await ethers.getContractFactory("PauseFacet", deployer);
      const pause = await deployContract(pauseFactory);

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

      if (!hasOrchestratorLibraryAddresses()) {
        setOrchestratorLibraryAddresses(await deployOrchestratorLibraries(deployer));
      }
      const freezeFactory = await ethers.getContractFactory("FreezeFacet", {
        signer: deployer,
        libraries: getLibLinks(...getFacetRequiredLibraries("FreezeFacet")),
      });
      const freeze = await deployContract(freezeFactory as any);

      const lockFactory = await ethers.getContractFactory("CapFacet", deployer);
      const lock = await deployContract(lockFactory);

      const newFacetsWithKeys = [
        {
          name: "FreezeFacet",
          address: freeze.address!,
          resolverKey: atsRegistry.getFacetDefinition("FreezeFacet")!.resolverKey!.value,
        },
        {
          name: "CapFacet",
          address: lock.address!,
          resolverKey: atsRegistry.getFacetDefinition("CapFacet")!.resolverKey!.value,
        },
      ];
      await registerAdditionalFacets(deployer, {
        blrAddress,
        newFacets: newFacetsWithKeys,
      });

      const facetNames = ["AccessControlFacet", "KycFacet", "PauseFacet", "FreezeFacet", "CapFacet"];

      for (const name of facetNames) {
        const facetDefinition = atsRegistry.getFacetDefinition(name);
        const key = facetDefinition!.resolverKey!.value;
        const address = await blr.resolveLatestBusinessLogic(key);
        expect(address).to.not.equal(ethers.ZeroAddress);
      }
    });
  });
});
