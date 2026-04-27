// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ComplianceMock, IdentityRegistryMock, IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("BatchBurn Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  async function deployBatchBurnFixture() {
    const infrastructure = await loadFixture(deployAtsInfrastructureFixture);

    complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
    await complianceMock.waitForDeployment();

    identityRegistryMock = await (
      await ethers.getContractFactory("IdentityRegistryMock", signer_A)
    ).deploy(true, false);
    await identityRegistryMock.waitForDeployment();

    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          compliance: complianceMock.target as string,
          identityRegistry: identityRegistryMock.target as string,
          maxSupply: MAX_SUPPLY,
        },
      },
      infrastructure,
    });

    const diamond: ResolverProxy = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_D = base.user3;
    signer_E = base.user4;

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
        role: ATS_ROLES.AGENT_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
    await asset.addIssuer(signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    await asset.grantRole(ATS_ROLES.PAUSER_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployBatchBurnFixture);
  });

  describe("batchBurn", () => {
    const burnAmount = AMOUNT / 2;

    beforeEach(async () => {
      await asset.mint(signer_D.address, burnAmount);
      await asset.mint(signer_E.address, burnAmount);

      // The burner (signer_A) needs approval from the token holders
      await asset.connect(signer_D).approve(signer_A.address, burnAmount);
      await asset.connect(signer_E).approve(signer_A.address, burnAmount);
    });

    it("GIVEN approved operator WHEN batchBurn THEN transaction succeeds", async () => {
      const userAddresses = [signer_D.address, signer_E.address];
      const amounts = [burnAmount, burnAmount];

      const initialTotalSupply = await asset.totalSupply();
      const initialBalanceD = await asset.balanceOf(signer_D.address);
      const initialBalanceE = await asset.balanceOf(signer_E.address);

      await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.not.be.reverted;

      const finalTotalSupply = await asset.totalSupply();
      const finalBalanceD = await asset.balanceOf(signer_D.address);
      const finalBalanceE = await asset.balanceOf(signer_E.address);

      expect(finalBalanceD).to.equal(initialBalanceD - BigInt(burnAmount));
      expect(finalBalanceE).to.equal(initialBalanceE - BigInt(burnAmount));
      expect(finalTotalSupply).to.equal(initialTotalSupply - BigInt(burnAmount * 2));
    });

    it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
      const userAddresses = [signer_D.address];
      const amounts = [burnAmount, burnAmount];

      await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
        asset,
        "InputAmountsArrayLengthMismatch",
      );
    });

    it("GIVEN a paused token WHEN batchBurn THEN transaction fails with TokenIsPaused", async () => {
      await asset.pause();

      const userAddresses = [signer_D.address];
      const amounts = [burnAmount];

      await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });
  });

  describe("multi partition", () => {
    beforeEach(async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
          },
        },
      });
      signer_A = base.deployer;
      asset = await ethers.getContractAt("IAsset", base.diamond.target);
    });

    it("GIVEN an single partition token WHEN batchBurn THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.batchBurn([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });

  describe("Token is controllable", () => {
    async function deployNotControllableFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isControllable: false,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", base.diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.CONTROLLER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.mint(signer_D.address, AMOUNT);
    }

    beforeEach(async () => {
      await loadFixture(deployNotControllableFixture);
    });

    it("GIVEN token is not controllable WHEN batchBurn THEN transaction fails with TokenIsNotControllable", async () => {
      const userAddresses = [signer_D.address];
      const amounts = [AMOUNT];

      await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
        asset,
        "TokenIsNotControllable",
      );
    });
  });
});
