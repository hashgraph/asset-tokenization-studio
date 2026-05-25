// SPDX-License-Identifier: Apache-2.0

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  AccessControl,
  FreezeFacet,
  Pause,
  BusinessLogicResolver,
  PauseFacet,
  PauseFacet__factory,
  NoncesFacet,
  NoncesFacet__factory,
  KycFacet,
  KycFacet__factory,
  LockFacet,
} from "@contract-types";
import { EQUITY_CONFIG_ID, ATS_ROLES } from "@scripts";
import { deployOrchestratorLibraries, getFacetLibraryLinks, hasOrchestratorLibraryAddresses } from "@scripts/domain";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";

describe("BusinessLogicResolver", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let businessLogicResolver: BusinessLogicResolver;
  let accessControl: AccessControl;
  let pause: Pause;
  let freezeFacet: FreezeFacet;

  let BUSINESS_LOGIC_KEYS: { businessLogicKey: string; businessLogicAddress: string }[];

  enum VersionStatus {
    NONE = 0,
    ACTIVATED = 1,
    DEACTIVATED = 2,
  }

  async function deployBusinessLogicResolverFixture() {
    [signer_A, signer_B, signer_C] = await ethers.getSigners();
    businessLogicResolver = await (await ethers.getContractFactory("BusinessLogicResolver", signer_A)).deploy();

    await businessLogicResolver.initialize_BusinessLogicResolver();
    accessControl = await ethers.getContractAt("AccessControl", businessLogicResolver.target, signer_A);
    await accessControl.grantRole(ATS_ROLES.ROLE_PAUSER, signer_B.address);

    pause = await ethers.getContractAt("Pause", businessLogicResolver.target);

    // FreezeFacet and LockFacet inline call paths that DELEGATECALL into ScheduledTasksOps,
    // so their bytecode carries a library link placeholder that must be resolved at deploy time.
    if (!hasOrchestratorLibraryAddresses()) {
      await deployOrchestratorLibraries(signer_A);
    }
    const freezeFactory = await ethers.getContractFactory("FreezeFacet", {
      signer: signer_A,
      libraries: getFacetLibraryLinks("FreezeFacet"),
    });
    freezeFacet = (await freezeFactory.deploy()) as unknown as FreezeFacet;

    const pauseFacet: PauseFacet = await new PauseFacet__factory(signer_A).deploy();
    const noncesFacet: NoncesFacet = await new NoncesFacet__factory(signer_A).deploy();
    const kycFacet: KycFacet = await new KycFacet__factory(signer_A).deploy();
    const lockFactory = await ethers.getContractFactory("LockFacet", {
      signer: signer_A,
      libraries: getFacetLibraryLinks("LockFacet"),
    });
    const lockFacet: LockFacet = (await lockFactory.deploy()) as unknown as LockFacet;

    BUSINESS_LOGIC_KEYS = [
      {
        businessLogicKey: await pauseFacet.getStaticResolverKey(),
        businessLogicAddress: (await pauseFacet.getAddress()).toString(),
      },
      {
        businessLogicKey: await noncesFacet.getStaticResolverKey(),
        businessLogicAddress: (await noncesFacet.getAddress()).toString(),
      },
      {
        businessLogicKey: await kycFacet.getStaticResolverKey(),
        businessLogicAddress: (await kycFacet.getAddress()).toString(),
      },
      {
        businessLogicKey: await lockFacet.getStaticResolverKey(),
        businessLogicAddress: (await lockFacet.getAddress()).toString(),
      },
    ];
  }

  beforeEach(async () => {
    await loadFixture(deployBusinessLogicResolverFixture);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(businessLogicResolver.initialize_BusinessLogicResolver()).to.be.revertedWithCustomError(
      businessLogicResolver,
      "AlreadyInitialized",
    );
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await pause.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN registrying logics THEN transaction fails with IsPaused", async () => {
      // transfer with data fails
      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2)),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });

    it("GIVEN a paused contract WHEN addSelectorsToBlacklist is called THEN transaction fails with IsPaused", async () => {
      await expect(
        businessLogicResolver.addSelectorsToBlacklist(EQUITY_CONFIG_ID, ["0x8456cb59"]),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });

    it("GIVEN a paused contract WHEN removeSelectorsFromBlacklist is called THEN transaction fails with IsPaused", async () => {
      await expect(
        businessLogicResolver.removeSelectorsFromBlacklist(EQUITY_CONFIG_ID, ["0x8456cb59"]),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without admin role WHEN registrying logics THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(
        businessLogicResolver.connect(signer_C).registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2)),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });

    it("GIVEN an account without admin role WHEN adding selectors to blacklist THEN transaction fails with AccountHasNoRole", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await expect(
        businessLogicResolver.connect(signer_C).addSelectorsToBlacklist(EQUITY_CONFIG_ID, blackListedSelectors),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });

    it("GIVEN an account without admin role WHEN removing selectors from blacklist THEN transaction fails with AccountHasNoRole", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await expect(
        businessLogicResolver.connect(signer_C).removeSelectorsFromBlacklist(EQUITY_CONFIG_ID, blackListedSelectors),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });
  });

  describe("Business Logic Resolver functionality", () => {
    it("GIVEN an empty registry WHEN getting data THEN responds empty values or BusinessLogicVersionDoesNotExist", async () => {
      expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(0);
      expect(
        await businessLogicResolver.getLatestVersions([
          BUSINESS_LOGIC_KEYS[0].businessLogicKey,
          BUSINESS_LOGIC_KEYS[1].businessLogicKey,
        ]),
      ).is.deep.equal([0n, 0n]);
      await expect(
        businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 0),
      ).to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicVersionDoesNotExist");
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(
        ethers.ZeroAddress,
      );
      await expect(
        businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 0),
      ).to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicVersionDoesNotExist");
      await expect(
        businessLogicResolver.resolveBusinessLogicByVersion(BUSINESS_LOGIC_KEYS[0].businessLogicKey, 1),
      ).to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicVersionDoesNotExist");
      expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(0);
      expect(await businessLogicResolver.getBusinessLogicKeys(1, 10)).is.deep.equal([]);
    });

    it("GIVEN an empty key WHEN registerBusinessLogics THEN Fails with ZeroKeyNotValidForBusinessLogic", async () => {
      const BUSINESS_LOGICS_TO_REGISTER = [
        {
          businessLogicKey: ethers.ZeroHash,
          businessLogicAddress: BUSINESS_LOGIC_KEYS[0].businessLogicAddress,
        },
      ];

      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER),
      ).to.be.revertedWithCustomError(businessLogicResolver, "ZeroKeyNotValidForBusinessLogic");
    });

    it("GIVEN a zero address WHEN registerBusinessLogics THEN Fails with ZeroAddressNotAllowed", async () => {
      const BUSINESS_LOGICS_TO_REGISTER = [
        {
          businessLogicKey: BUSINESS_LOGIC_KEYS[0].businessLogicKey,
          businessLogicAddress: ethers.ZeroAddress,
        },
      ];

      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER),
      ).to.be.revertedWithCustomError(businessLogicResolver, "ZeroAddressNotAllowed");
    });

    it("GIVEN an duplicated key WHEN registerBusinessLogics THEN Fails with BusinessLogicKeyDuplicated", async () => {
      const BUSINESS_LOGICS_TO_REGISTER = [BUSINESS_LOGIC_KEYS[0], BUSINESS_LOGIC_KEYS[0]];

      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER),
      ).to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicKeyDuplicated");
    });

    it("GIVEN an empty registry WHEN registerBusinessLogics THEN queries responds with correct values", async () => {
      const LATEST_VERSIONS = [1, 1];

      const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 2);
      expect(await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER))
        .to.emit(businessLogicResolver, "BusinessLogicsRegistered")
        .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSIONS);

      expect(
        await businessLogicResolver.getLatestVersions(BUSINESS_LOGICS_TO_REGISTER.map((b) => b.businessLogicKey)),
      ).is.deep.equal(LATEST_VERSIONS.map((v) => BigInt(v)));

      for (let i = 0; i < BUSINESS_LOGICS_TO_REGISTER.length; i++) {
        expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGICS_TO_REGISTER[i].businessLogicKey)).is.equal(
          LATEST_VERSIONS[i],
        );
        expect(
          await businessLogicResolver.getVersionStatus(
            BUSINESS_LOGICS_TO_REGISTER[i].businessLogicKey,
            LATEST_VERSIONS[i],
          ),
        ).to.be.equal(VersionStatus.ACTIVATED);
        expect(
          await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[i].businessLogicKey),
        ).is.equal(BUSINESS_LOGIC_KEYS[i].businessLogicAddress);

        expect(
          await businessLogicResolver.resolveBusinessLogicByVersion(
            BUSINESS_LOGIC_KEYS[i].businessLogicKey,
            LATEST_VERSIONS[i],
          ),
        ).to.be.equal(BUSINESS_LOGIC_KEYS[i].businessLogicAddress);
      }

      expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length);
      expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
        BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey),
      );
    });

    it("GIVEN a list of logics WHEN registerBusinessLogics in batch THEN success", async () => {
      await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2));
      await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(2, BUSINESS_LOGIC_KEYS.length));

      expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGIC_KEYS.length);
      expect(await businessLogicResolver.getBusinessLogicKeys(0, BUSINESS_LOGIC_KEYS.length)).is.deep.equal(
        BUSINESS_LOGIC_KEYS.map((businessLogic) => businessLogic.businessLogicKey),
      );
    });

    it("GIVEN an registry with 1 version WHEN registerBusinessLogics with different keys THEN queries responds with correct values", async () => {
      await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2));

      const LATEST_VERSIONS = [2, 2, 1];

      const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 3);
      expect(await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER))
        .to.emit(businessLogicResolver, "BusinessLogicsRegistered")
        .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSIONS);

      for (let i = 0; i < BUSINESS_LOGICS_TO_REGISTER.length; i++) {
        expect(await businessLogicResolver.getLatestVersion(BUSINESS_LOGIC_KEYS[i].businessLogicKey)).is.equal(
          LATEST_VERSIONS[i],
        );
        expect(
          await businessLogicResolver.getVersionStatus(BUSINESS_LOGIC_KEYS[i].businessLogicKey, LATEST_VERSIONS[i]),
        ).to.be.equal(VersionStatus.ACTIVATED);

        expect(
          await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[i].businessLogicKey),
        ).is.equal(BUSINESS_LOGIC_KEYS[i].businessLogicAddress);
        expect(
          await businessLogicResolver.resolveBusinessLogicByVersion(
            BUSINESS_LOGIC_KEYS[i].businessLogicKey,
            LATEST_VERSIONS[i],
          ),
        ).to.be.equal(BUSINESS_LOGIC_KEYS[i].businessLogicAddress);
      }

      expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length);
      expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
        BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey),
      );
    });

    it("GIVEN one facet registered twice and another once THEN status lookups stay scoped per facet", async () => {
      // FIND-009 reproducer: pre-fix, a single global counter meant facet B's "version 2"
      // was reported ACTIVATED whenever ANY facet had been registered twice. Post-fix,
      // each facet has its own counter and B's version 2 must not exist.
      const [facetA, facetB] = BUSINESS_LOGIC_KEYS;

      await businessLogicResolver.registerBusinessLogics([facetA, facetB]);
      await businessLogicResolver.registerBusinessLogics([facetA]);

      expect(await businessLogicResolver.getLatestVersion(facetA.businessLogicKey)).is.equal(2);
      expect(await businessLogicResolver.getLatestVersion(facetB.businessLogicKey)).is.equal(1);

      expect(await businessLogicResolver.getVersionStatus(facetA.businessLogicKey, 2)).to.be.equal(
        VersionStatus.ACTIVATED,
      );
      expect(await businessLogicResolver.getVersionStatus(facetA.businessLogicKey, 1)).to.be.equal(
        VersionStatus.ACTIVATED,
      );
      expect(await businessLogicResolver.getVersionStatus(facetB.businessLogicKey, 1)).to.be.equal(
        VersionStatus.ACTIVATED,
      );

      await expect(businessLogicResolver.getVersionStatus(facetB.businessLogicKey, 2)).to.be.revertedWithCustomError(
        businessLogicResolver,
        "BusinessLogicVersionDoesNotExist",
      );
    });

    it("GIVEN a configuration add a selector to the blacklist THEN queries respond with correct values", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await businessLogicResolver.addSelectorsToBlacklist(EQUITY_CONFIG_ID, blackListedSelectors);

      expect(await businessLogicResolver.getSelectorsBlacklist(EQUITY_CONFIG_ID, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );

      await businessLogicResolver.removeSelectorsFromBlacklist(EQUITY_CONFIG_ID, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(EQUITY_CONFIG_ID, 0, 100)).to.deep.equal([]);
    });

    it("GIVEN a selector already in blacklist WHEN adding it again THEN it should not be duplicated", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await businessLogicResolver.addSelectorsToBlacklist(EQUITY_CONFIG_ID, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(EQUITY_CONFIG_ID, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );

      // Add the same selector again
      await businessLogicResolver.addSelectorsToBlacklist(EQUITY_CONFIG_ID, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(EQUITY_CONFIG_ID, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );
    });

    it("GIVEN a selector not in blacklist WHEN removing it THEN nothing changes", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      // Remove a selector that doesn't exist
      await businessLogicResolver.removeSelectorsFromBlacklist(EQUITY_CONFIG_ID, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(EQUITY_CONFIG_ID, 0, 100)).to.deep.equal([]);
    });
  });

  it("GIVEN a facet registered with a mismatched key WHEN registerBusinessLogics THEN fails with BusinessLogicKeyMismatch", async () => {
    const actualResolverKey = await freezeFacet.getStaticResolverKey();
    const lastChar = actualResolverKey.slice(-1);
    const mutatedChar = lastChar === "0" ? "1" : "0";

    const wrongKey = actualResolverKey.slice(0, -1) + mutatedChar;

    await expect(
      businessLogicResolver.registerBusinessLogics([
        { businessLogicKey: wrongKey, businessLogicAddress: freezeFacet.target },
      ]),
    )
      .to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicKeyMismatch")
      .withArgs(freezeFacet.target, actualResolverKey, wrongKey);
  });
});
