// SPDX-License-Identifier: Apache-2.0

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  AccessControl,
  AccessControlTestHelper,
  AccessControlTestHelper__factory,
  FreezeFacet,
  Pause,
  PauseTestHelper,
  PauseTestHelper__factory,
  BusinessLogicResolver,
  PauseFacet,
  PauseFacet__factory,
  NoncesFacet,
  NoncesFacet__factory,
  KycFacet,
  KycFacet__factory,
  LockFacet,
} from "@contract-types";
import { ATS_ROLES, ADDRESS_ZERO, CONFIG_IDS } from "@lib";
import { deployOrchestratorLibraries, getFacetLibraryLinks, hasOrchestratorLibraryAddresses } from "@lib/domain";
import { deployAtsInfrastructureFixture } from "@test";
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

    await businessLogicResolver.initializeBusinessLogicResolver();
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
    await expect(businessLogicResolver.initializeBusinessLogicResolver()).to.be.revertedWithCustomError(
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
        businessLogicResolver.addSelectorsToBlacklist(CONFIG_IDS.equity, ["0x8456cb59"]),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });

    it("GIVEN a paused contract WHEN removeSelectorsFromBlacklist is called THEN transaction fails with IsPaused", async () => {
      await expect(
        businessLogicResolver.removeSelectorsFromBlacklist(CONFIG_IDS.equity, ["0x8456cb59"]),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });

    it("GIVEN a paused contract WHEN updateReplacementAddress is called THEN transaction fails with IsPaused", async () => {
      await expect(
        businessLogicResolver.updateReplacementAddress(
          "0x0102030405010203040501020304050102030405",
          "0x0504030201050403020105040302010504030201",
        ),
      ).to.be.revertedWithCustomError(businessLogicResolver, "IsPaused");
    });

    it("GIVEN a paused contract WHEN removeReplacementAddress is called THEN transaction fails with IsPaused", async () => {
      await expect(
        businessLogicResolver.removeReplacementAddress("0x0102030405010203040501020304050102030405"),
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
        businessLogicResolver.connect(signer_C).addSelectorsToBlacklist(CONFIG_IDS.equity, blackListedSelectors),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });

    it("GIVEN an account without admin role WHEN removing selectors from blacklist THEN transaction fails with AccountHasNoRole", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await expect(
        businessLogicResolver.connect(signer_C).removeSelectorsFromBlacklist(CONFIG_IDS.equity, blackListedSelectors),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });

    it("GIVEN an account without admin role WHEN updating replacement address THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        businessLogicResolver
          .connect(signer_C)
          .updateReplacementAddress(
            "0x0102030405010203040501020304050102030405",
            "0x0504030201050403020105040302010504030201",
          ),
      ).to.be.revertedWithCustomError(businessLogicResolver, "AccountHasNoRole");
    });

    it("GIVEN an account without admin role WHEN removing replacement address THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        businessLogicResolver.connect(signer_C).removeReplacementAddress("0x0102030405010203040501020304050102030405"),
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

      await businessLogicResolver.addSelectorsToBlacklist(CONFIG_IDS.equity, blackListedSelectors);

      expect(await businessLogicResolver.getSelectorsBlacklist(CONFIG_IDS.equity, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );

      await businessLogicResolver.removeSelectorsFromBlacklist(CONFIG_IDS.equity, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(CONFIG_IDS.equity, 0, 100)).to.deep.equal([]);
    });

    it("GIVEN a selector already in blacklist WHEN adding it again THEN it should not be duplicated", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      await businessLogicResolver.addSelectorsToBlacklist(CONFIG_IDS.equity, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(CONFIG_IDS.equity, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );

      // Add the same selector again
      await businessLogicResolver.addSelectorsToBlacklist(CONFIG_IDS.equity, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(CONFIG_IDS.equity, 0, 100)).to.deep.equal(
        blackListedSelectors,
      );
    });

    it("GIVEN a selector not in blacklist WHEN removing it THEN nothing changes", async () => {
      const blackListedSelectors = ["0x8456cb59"]; // pause() selector

      // Remove a selector that doesn't exist
      await businessLogicResolver.removeSelectorsFromBlacklist(CONFIG_IDS.equity, blackListedSelectors);
      expect(await businessLogicResolver.getSelectorsBlacklist(CONFIG_IDS.equity, 0, 100)).to.deep.equal([]);
    });

    it("GIVEN address zero WHEN replacing it THEN transaction fails with ZeroAddressNotAllowed", async () => {
      await expect(
        businessLogicResolver.updateReplacementAddress(ADDRESS_ZERO, "0x0504030201050403020105040302010504030201"),
      ).to.be.revertedWithCustomError(businessLogicResolver, "ZeroAddressNotAllowed");
    });

    it("GIVEN address zero WHEN using it to replace another one THEN transaction fails with ZeroAddressNotAllowed", async () => {
      await expect(
        businessLogicResolver.updateReplacementAddress("0x0504030201050403020105040302010504030201", ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(businessLogicResolver, "ZeroAddressNotAllowed");
    });

    it("GIVEN an address WHEN replacing it then removing itTHEN transactions success", async () => {
      const replacedAddress = "0x0102030405010203040501020304050102030405";
      const newAddress = "0x0504030201050403020105040302010504030201";
      await expect(businessLogicResolver.updateReplacementAddress(replacedAddress, newAddress))
        .to.emit(businessLogicResolver, "ReplacementAddressUpdated")
        .withArgs(replacedAddress, newAddress);

      const replacementAddress = await businessLogicResolver.getReplacementAddress(replacedAddress);
      expect(replacementAddress).to.equal(newAddress);

      await expect(businessLogicResolver.removeReplacementAddress(replacedAddress))
        .to.emit(businessLogicResolver, "ReplacementAddressRemoved")
        .withArgs(replacedAddress, newAddress);

      const replacementAddressAfterRemoval = await businessLogicResolver.getReplacementAddress(replacedAddress);
      expect(replacementAddressAfterRemoval).to.equal(ADDRESS_ZERO);
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

  describe("AccessControl interface", () => {
    describe("initializeAccessControl", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeAccessControl THEN fails with AccountHasNoRole", async () => {
        await expect(accessControl.connect(signer_C).initializeAccessControl())
          .to.be.revertedWithCustomError(accessControl, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      // The success and FacetAlreadyRegistered tests use AccessControlTestHelper (a concrete
      // subclass of AccessControl) with a proper BLR setup so that setFacetToReady can call
      // currentFacetVersion successfully.  The lightweight BLR fixture lacks a resolver-proxy
      // configuration, so these tests need the full infrastructure fixture instead.
      describe("with full infrastructure", () => {
        let helper: AccessControlTestHelper;

        beforeEach(async () => {
          const infra = await loadFixture(deployAtsInfrastructureFixture);
          helper = await new AccessControlTestHelper__factory(infra.deployer).deploy();
          await helper.setupResolverProxy(await infra.blr.getAddress(), CONFIG_IDS.equity, 1);
          await helper.grantAdminRole(infra.deployer.address);
        });

        it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeAccessControl THEN emits AccessControlInitialized", async () => {
          await expect(helper.initializeAccessControl()).to.emit(helper, "AccessControlInitialized");
        });

        it("GIVEN already initialized WHEN initializeAccessControl again THEN fails with FacetAlreadyRegistered", async () => {
          await helper.initializeAccessControl();
          await expect(helper.initializeAccessControl()).to.be.revertedWithCustomError(
            helper,
            "FacetAlreadyRegistered",
          );
        });
      });
    });

    describe("grantRole", () => {
      it("GIVEN a role already granted WHEN grantRole THEN fails with AccountAssignedToRole", async () => {
        await expect(accessControl.grantRole(ATS_ROLES.ROLE_PAUSER, signer_B.address))
          .to.be.revertedWithCustomError(accessControl, "AccountAssignedToRole")
          .withArgs(ATS_ROLES.ROLE_PAUSER, signer_B.address);
      });

      it("GIVEN a caller without admin role WHEN grantRole THEN fails with AccountHasNoRole", async () => {
        await expect(accessControl.connect(signer_C).grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address))
          .to.be.revertedWithCustomError(accessControl, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN a paused resolver WHEN grantRole THEN fails with IsPaused", async () => {
        await pause.connect(signer_B).pause();
        await expect(accessControl.grantRole(ATS_ROLES.ROLE_PAUSER, signer_C.address)).to.be.revertedWithCustomError(
          accessControl,
          "IsPaused",
        );
      });
    });

    describe("revokeRole", () => {
      it("GIVEN a role-holder WHEN revokeRole THEN emits RoleRevoked", async () => {
        await expect(accessControl.revokeRole(ATS_ROLES.ROLE_PAUSER, signer_B.address))
          .to.emit(accessControl, "RoleRevoked")
          .withArgs(signer_A.address, signer_B.address, ATS_ROLES.ROLE_PAUSER);
      });

      it("GIVEN an account without the role WHEN revokeRole THEN fails with AccountNotAssignedToRole", async () => {
        await expect(accessControl.revokeRole(ATS_ROLES.ROLE_PAUSER, signer_C.address))
          .to.be.revertedWithCustomError(accessControl, "AccountNotAssignedToRole")
          .withArgs(ATS_ROLES.ROLE_PAUSER, signer_C.address);
      });

      it("GIVEN a caller without admin role WHEN revokeRole THEN fails with AccountHasNoRole", async () => {
        await expect(accessControl.connect(signer_C).revokeRole(ATS_ROLES.ROLE_PAUSER, signer_B.address))
          .to.be.revertedWithCustomError(accessControl, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN a paused resolver WHEN revokeRole THEN fails with IsPaused", async () => {
        await pause.connect(signer_B).pause();
        await expect(accessControl.revokeRole(ATS_ROLES.ROLE_PAUSER, signer_B.address)).to.be.revertedWithCustomError(
          accessControl,
          "IsPaused",
        );
      });
    });

    describe("renounceRole", () => {
      it("GIVEN a role-holder WHEN renounceRole THEN emits RoleRenounced", async () => {
        await expect(accessControl.connect(signer_B).renounceRole(ATS_ROLES.ROLE_PAUSER))
          .to.emit(accessControl, "RoleRenounced")
          .withArgs(signer_B.address, ATS_ROLES.ROLE_PAUSER);
      });

      it("GIVEN an account without the role WHEN renounceRole THEN fails with AccountNotAssignedToRole", async () => {
        await expect(accessControl.connect(signer_C).renounceRole(ATS_ROLES.ROLE_PAUSER))
          .to.be.revertedWithCustomError(accessControl, "AccountNotAssignedToRole")
          .withArgs(ATS_ROLES.ROLE_PAUSER, signer_C.address);
      });

      it("GIVEN the sole DEFAULT_ADMIN_ROLE holder WHEN renounceRole THEN fails with CannotRenounceSoleAdmin", async () => {
        await expect(
          accessControl.connect(signer_A).renounceRole(ATS_ROLES.DEFAULT_ADMIN_ROLE),
        ).to.be.revertedWithCustomError(accessControl, "CannotRenounceSoleAdmin");
      });

      it("GIVEN a paused resolver WHEN renounceRole THEN fails with IsPaused", async () => {
        await pause.connect(signer_B).pause();
        await expect(accessControl.connect(signer_B).renounceRole(ATS_ROLES.ROLE_PAUSER)).to.be.revertedWithCustomError(
          accessControl,
          "IsPaused",
        );
      });
    });

    describe("applyRoles", () => {
      it("GIVEN valid inputs WHEN applyRoles THEN emits RolesApplied", async () => {
        await expect(accessControl.applyRoles([ATS_ROLES.ROLE_PAUSER], [true], signer_C.address)).to.emit(
          accessControl,
          "RolesApplied",
        );
      });

      it("GIVEN mismatched array lengths WHEN applyRoles THEN fails with RolesAndActivesLengthMismatch", async () => {
        await expect(
          accessControl.applyRoles([ATS_ROLES.ROLE_PAUSER], [true, false], signer_C.address),
        ).to.be.revertedWithCustomError(accessControl, "RolesAndActivesLengthMismatch");
      });

      it("GIVEN a caller without admin role WHEN applyRoles THEN fails with AccountHasNoRole", async () => {
        await expect(
          accessControl.connect(signer_C).applyRoles([ATS_ROLES.ROLE_PAUSER], [true], signer_A.address),
        ).to.be.revertedWithCustomError(accessControl, "AccountHasNoRole");
      });

      it("GIVEN a paused resolver WHEN applyRoles THEN fails with IsPaused", async () => {
        await pause.connect(signer_B).pause();
        await expect(
          accessControl.applyRoles([ATS_ROLES.ROLE_PAUSER], [true], signer_C.address),
        ).to.be.revertedWithCustomError(accessControl, "IsPaused");
      });
    });
  });

  describe("Pause interface", () => {
    describe("initializePause", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializePause THEN fails with AccountHasNoRole", async () => {
        await expect(pause.connect(signer_C).initializePause())
          .to.be.revertedWithCustomError(pause, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      // Success and FacetAlreadyRegistered require a properly wired resolver proxy so that
      // setFacetToReady can call currentFacetVersion.  PauseTestHelper wraps Pause.sol with
      // backdoor setup helpers and is pointed at the fully-deployed infrastructure BLR.
      describe("with full infrastructure", () => {
        let helper: PauseTestHelper;

        beforeEach(async () => {
          const infra = await loadFixture(deployAtsInfrastructureFixture);
          helper = await new PauseTestHelper__factory(infra.deployer).deploy();
          await helper.setupResolverProxy(await infra.blr.getAddress(), CONFIG_IDS.equity, 1);
          await helper.grantAdminRole(infra.deployer.address);
        });

        it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializePause THEN emits PauseInitialized", async () => {
          await expect(helper.initializePause()).to.emit(helper, "PauseInitialized");
        });

        it("GIVEN already initialized WHEN initializePause again THEN fails with FacetAlreadyRegistered", async () => {
          await helper.initializePause();
          await expect(helper.initializePause()).to.be.revertedWithCustomError(helper, "FacetAlreadyRegistered");
        });
      });
    });
  });
});
