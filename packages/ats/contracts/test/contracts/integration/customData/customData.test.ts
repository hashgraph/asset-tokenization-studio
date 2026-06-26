// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_CUSTOM_DATA } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac } from "@test";

const KEY_A = ethers.id("customData.test.key.A");
const KEY_B = ethers.id("customData.test.key.B");
const UNSET_KEY = ethers.id("customData.test.key.unset");

const PAYLOAD_1 = ethers.hexlify(ethers.toUtf8Bytes("payload-one"));
const PAYLOAD_2 = ethers.hexlify(ethers.toUtf8Bytes("payload-two-longer-content"));
const PAYLOAD_3 = ethers.hexlify(ethers.toUtf8Bytes("payload-three"));

describe("CustomData Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  let signer_A: HardhatEthersSigner; // admin / custom data manager
  let signer_B: HardhatEthersSigner; // pauser
  let signer_C: HardhatEthersSigner; // unprivileged caller

  async function deployCustomDataFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_CUSTOM_DATA_MANAGER,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deployCustomDataFixture);
  });

  describe("AccessControl", () => {
    it("GIVEN an account without custom data manager role WHEN setCustomData THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).setCustomData(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an account without custom data manager role WHEN setCustomDataBatch THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_C).setCustomDataBatch([{ key: KEY_A, value: [PAYLOAD_1] }]),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });
  });

  describe("Paused", () => {
    beforeEach(async () => {
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setCustomData THEN transaction fails with IsPaused", async () => {
      await expect(asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a paused Token WHEN setCustomDataBatch THEN transaction fails with IsPaused", async () => {
      await expect(
        asset.connect(signer_A).setCustomDataBatch([{ key: KEY_A, value: [PAYLOAD_1] }]),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });
  });

  describe("setCustomData & getCustomData", () => {
    it("GIVEN role and unpaused token WHEN setCustomData THEN emits CustomDataSet with correct key and value", async () => {
      await expect(asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1]))
        .to.emit(asset, "CustomDataSet")
        .withArgs(KEY_A, [PAYLOAD_1]);
    });
    it("GIVEN role and unpaused token WHEN setCustomData with a single payload THEN getCustomData returns it", async () => {
      await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1]);

      const stored = await asset.getCustomData(KEY_A);
      expect(stored).to.deep.equal([PAYLOAD_1]);
    });

    it("GIVEN role and unpaused token WHEN setCustomData with multiple payloads THEN getCustomData preserves order", async () => {
      const value = [PAYLOAD_1, PAYLOAD_2, PAYLOAD_3];

      await asset.connect(signer_A).setCustomData(KEY_A, value);

      const stored = await asset.getCustomData(KEY_A);
      expect(stored).to.deep.equal(value);
    });

    it("GIVEN an existing custom data entry WHEN setCustomData is called again THEN the previous value is fully overwritten", async () => {
      await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

      await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_3]);

      const stored = await asset.getCustomData(KEY_A);
      expect(stored).to.deep.equal([PAYLOAD_3]);
    });

    it("GIVEN an existing custom data entry WHEN setCustomData is called with an empty array THEN the entry is cleared", async () => {
      await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

      await asset.connect(signer_A).setCustomData(KEY_A, []);

      const stored = await asset.getCustomData(KEY_A);
      expect(stored).to.deep.equal([]);
    });

    it("GIVEN a key that has never been set WHEN getCustomData THEN it returns an empty array", async () => {
      const stored = await asset.getCustomData(UNSET_KEY);
      expect(stored).to.deep.equal([]);
    });
  });

  describe("setCustomDataBatch", () => {
    it("GIVEN role and unpaused token WHEN setCustomDataBatch with two entries THEN getCustomData returns each value", async () => {
      await asset.connect(signer_A).setCustomDataBatch([
        { key: KEY_A, value: [PAYLOAD_1] },
        { key: KEY_B, value: [PAYLOAD_2] },
      ]);

      expect(await asset.getCustomData(KEY_A)).to.deep.equal([PAYLOAD_1]);
      expect(await asset.getCustomData(KEY_B)).to.deep.equal([PAYLOAD_2]);
    });

    it("GIVEN role and unpaused token WHEN setCustomDataBatch with empty array THEN does not revert and no state change", async () => {
      await expect(asset.connect(signer_A).setCustomDataBatch([])).to.not.be.reverted;
      expect(await asset.getCustomData(KEY_A)).to.deep.equal([]);
    });

    it("GIVEN role and unpaused token WHEN setCustomDataBatch with two entries THEN emits a single CustomDataBatchSet with all entries", async () => {
      const entries = [
        { key: KEY_A, value: [PAYLOAD_1] },
        { key: KEY_B, value: [PAYLOAD_2] },
      ];
      await expect(asset.connect(signer_A).setCustomDataBatch(entries))
        .to.emit(asset, "CustomDataBatchSet")
        .withArgs(entries.map((e) => [e.key, e.value]));
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setCustomData THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setCustomData(ethers.ZeroHash, []),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN setCustomDataBatch THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).setCustomDataBatch([])).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("initializeCustomData", () => {
    const SEED_KEY_1 = ethers.encodeBytes32String("seed.key.one");
    const SEED_KEY_2 = ethers.encodeBytes32String("seed.key.two");
    const SEED_KEY_3 = ethers.encodeBytes32String("seed.key.three");
    const SEED_VALUE_1 = ethers.toUtf8Bytes("value-one");
    const SEED_VALUE_2 = ethers.toUtf8Bytes("value-two");
    const SEED_VALUE_3 = ethers.toUtf8Bytes("value-three");

    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCustomData is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeCustomData([]))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeCustomData is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeCustomData([]))
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_CUSTOM_DATA, 1);
    });

    describe("when not yet initialised", () => {
      beforeEach(async () => {
        await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_CUSTOM_DATA);
      });

      it("GIVEN empty entries WHEN initializeCustomData is called THEN emits CustomDataInitialized with empty entries", async () => {
        await expect(asset.initializeCustomData([])).to.emit(asset, "CustomDataInitialized").withArgs([]);
      });

      it("GIVEN a single seed entry WHEN initializeCustomData is called THEN getCustomData returns the seeded value", async () => {
        const entries = [{ key: SEED_KEY_1, value: [SEED_VALUE_1] }];

        const receipt = await asset.initializeCustomData(entries);

        expect(await asset.getCustomData(SEED_KEY_1)).to.deep.equal([ethers.hexlify(SEED_VALUE_1)]);
        await expect(receipt)
          .to.emit(asset, "CustomDataInitialized")
          .withArgs([[SEED_KEY_1, [ethers.hexlify(SEED_VALUE_1)]]]);
      });

      it("GIVEN a seed entry with multiple payloads WHEN initializeCustomData is called THEN getCustomData returns all payloads in order", async () => {
        const entries = [{ key: SEED_KEY_1, value: [SEED_VALUE_1, SEED_VALUE_2] }];

        await asset.initializeCustomData(entries);

        expect(await asset.getCustomData(SEED_KEY_1)).to.deep.equal([
          ethers.hexlify(SEED_VALUE_1),
          ethers.hexlify(SEED_VALUE_2),
        ]);
      });

      it("GIVEN multiple distinct seed entries WHEN initializeCustomData is called THEN each key returns its correct value", async () => {
        const entries = [
          { key: SEED_KEY_1, value: [SEED_VALUE_1] },
          { key: SEED_KEY_2, value: [SEED_VALUE_2] },
          { key: SEED_KEY_3, value: [SEED_VALUE_3] },
        ];

        await asset.initializeCustomData(entries);

        expect(await asset.getCustomData(SEED_KEY_1)).to.deep.equal([ethers.hexlify(SEED_VALUE_1)]);
        expect(await asset.getCustomData(SEED_KEY_2)).to.deep.equal([ethers.hexlify(SEED_VALUE_2)]);
        expect(await asset.getCustomData(SEED_KEY_3)).to.deep.equal([ethers.hexlify(SEED_VALUE_3)]);
      });

      it("GIVEN duplicate keys in seed entries WHEN initializeCustomData is called THEN last write wins", async () => {
        const entries = [
          { key: SEED_KEY_1, value: [SEED_VALUE_1] },
          { key: SEED_KEY_1, value: [SEED_VALUE_2] },
        ];

        await asset.initializeCustomData(entries);

        expect(await asset.getCustomData(SEED_KEY_1)).to.deep.equal([ethers.hexlify(SEED_VALUE_2)]);
      });

      it("GIVEN a seeded key WHEN getCustomData is called for an unseeded key THEN it returns an empty array", async () => {
        const entries = [{ key: SEED_KEY_1, value: [SEED_VALUE_1] }];

        await asset.initializeCustomData(entries);

        expect(await asset.getCustomData(SEED_KEY_2)).to.deep.equal([]);
      });
    });
  });
  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setCustomData THEN reverts with AssetNotOperational", async () => {
      await expect(asset.setCustomData(ethers.ZeroHash, [])).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN setCustomDataBatch THEN reverts with AssetNotOperational", async () => {
      await expect(asset.setCustomDataBatch([])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
