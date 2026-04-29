// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const maxSupply = 3;
const maxSupplyByPartition = 2;
const EMPTY_VC_ID = EMPTY_STRING;

describe("CapByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          maxSupply: maxSupply * 2,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CAP_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setMaxSupplyByPartition THEN transaction fails with TokenIsPaused", async () => {
      // transfer from with data fails
      await expect(
        asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupplyByPartition),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without cap role WHEN setMaxSupplyByPartition THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(
        asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });
  });

  describe("New Max Supply Too low or 0", () => {
    it("GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyForPartitionTooLow", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      await asset.connect(signer_C).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: maxSupply * 2,
        data: "0x",
      });

      // add to list fails
      await expect(
        asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply),
      ).to.be.revertedWithCustomError(asset, "NewMaxSupplyForPartitionTooLow");
    });
  });

  describe("New Max Supply By Partition Too High", () => {
    it("GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyByPartitionTooHigh", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      // add to list fails
      await expect(
        asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 100),
      ).to.be.revertedWithCustomError(asset, "NewMaxSupplyByPartitionTooHigh");
    });
  });

  describe("New Max Supply OK", () => {
    it("GIVEN a token WHEN setMaxSupplyByPartition THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_C.address);

      await expect(asset.connect(signer_C).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply * 2))
        .to.emit(asset, "MaxSupplyByPartitionSet")
        .withArgs(signer_C.address, _PARTITION_ID_1, maxSupply * 2, 0);

      const currentMaxSupply = await asset.getMaxSupplyByPartition(_PARTITION_ID_1);

      expect(currentMaxSupply).to.equal(maxSupply * 2);
    });
  });
});
