// SPDX-License-Identifier: Apache-2.0

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  AccessControl,
  FreezeFacet,
  FreezeFacet__factory,
  Pause,
  BusinessLogicResolver,
  PauseFacet,
  PauseFacet__factory,
  NoncesFacet,
  NoncesFacet__factory,
  KycFacet,
  KycFacet__factory,
  LockFacet,
  LockFacet__factory,
} from "@contract-types";
import { EQUITY_CONFIG_ID, ATS_ROLES } from "@scripts";
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
    await accessControl.grantRole(ATS_ROLES.PAUSER_ROLE, signer_B.address);

    pause = await ethers.getContractAt("Pause", businessLogicResolver.target);
    freezeFacet = await new FreezeFacet__factory(signer_A).deploy();

    const pauseFacet: PauseFacet = await new PauseFacet__factory(signer_A).deploy();
    const noncesFacet: NoncesFacet = await new NoncesFacet__factory(signer_A).deploy();
    const kycFacet: KycFacet = await new KycFacet__factory(signer_A).deploy();
    const lockFacet: LockFacet = await new LockFacet__factory(signer_A).deploy();

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

    it("GIVEN a paused Token WHEN registrying logics THEN transaction fails with TokenIsPaused", async () => {
      // transfer with data fails
      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2)),
      ).to.be.revertedWithCustomError(businessLogicResolver, "TokenIsPaused");
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
      expect(await businessLogicResolver.getLatestVersion()).is.equal(0);
      await expect(businessLogicResolver.getVersionStatus(0)).to.be.revertedWithCustomError(
        businessLogicResolver,
        "BusinessLogicVersionDoesNotExist",
      );
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

    it("GIVEN an duplicated key WHEN registerBusinessLogics THEN Fails with BusinessLogicKeyDuplicated", async () => {
      const BUSINESS_LOGICS_TO_REGISTER = [BUSINESS_LOGIC_KEYS[0], BUSINESS_LOGIC_KEYS[0]];

      await expect(
        businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER),
      ).to.be.revertedWithCustomError(businessLogicResolver, "BusinessLogicKeyDuplicated");
    });

    it("GIVEN an empty registry WHEN registerBusinessLogics THEN queries responds with correct values", async () => {
      const LATEST_VERSION = 1;
      const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 2);
      expect(await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER))
        .to.emit(businessLogicResolver, "BusinessLogicsRegistered")
        .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION);

      expect(await businessLogicResolver.getLatestVersion()).is.equal(LATEST_VERSION);
      expect(await businessLogicResolver.getVersionStatus(LATEST_VERSION)).to.be.equal(VersionStatus.ACTIVATED);
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(
        BUSINESS_LOGIC_KEYS[0].businessLogicAddress,
      );
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[1].businessLogicKey)).is.equal(
        BUSINESS_LOGIC_KEYS[1].businessLogicAddress,
      );
      expect(
        await businessLogicResolver.resolveBusinessLogicByVersion(
          BUSINESS_LOGIC_KEYS[0].businessLogicKey,
          LATEST_VERSION,
        ),
      ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress);
      expect(
        await businessLogicResolver.resolveBusinessLogicByVersion(
          BUSINESS_LOGIC_KEYS[1].businessLogicKey,
          LATEST_VERSION,
        ),
      ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress);
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

      const LATEST_VERSION = 2;
      const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 3);
      expect(await businessLogicResolver.registerBusinessLogics(BUSINESS_LOGICS_TO_REGISTER))
        .to.emit(businessLogicResolver, "BusinessLogicsRegistered")
        .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION);

      expect(await businessLogicResolver.getLatestVersion()).is.equal(LATEST_VERSION);
      expect(await businessLogicResolver.getVersionStatus(LATEST_VERSION)).to.be.equal(VersionStatus.ACTIVATED);
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[0].businessLogicKey)).is.equal(
        BUSINESS_LOGIC_KEYS[0].businessLogicAddress,
      );
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[1].businessLogicKey)).is.equal(
        BUSINESS_LOGIC_KEYS[1].businessLogicAddress,
      );
      expect(await businessLogicResolver.resolveLatestBusinessLogic(BUSINESS_LOGIC_KEYS[2].businessLogicKey)).is.equal(
        BUSINESS_LOGIC_KEYS[2].businessLogicAddress,
      );
      expect(
        await businessLogicResolver.resolveBusinessLogicByVersion(
          BUSINESS_LOGIC_KEYS[0].businessLogicKey,
          LATEST_VERSION,
        ),
      ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress);
      expect(
        await businessLogicResolver.resolveBusinessLogicByVersion(
          BUSINESS_LOGIC_KEYS[1].businessLogicKey,
          LATEST_VERSION,
        ),
      ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress);
      expect(
        await businessLogicResolver.resolveBusinessLogicByVersion(
          BUSINESS_LOGIC_KEYS[2].businessLogicKey,
          LATEST_VERSION,
        ),
      ).to.be.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress);
      expect(await businessLogicResolver.getBusinessLogicCount()).is.equal(BUSINESS_LOGICS_TO_REGISTER.length);
      expect(await businessLogicResolver.getBusinessLogicKeys(0, 10)).is.deep.equal(
        BUSINESS_LOGICS_TO_REGISTER.map((businessLogic) => businessLogic.businessLogicKey),
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
