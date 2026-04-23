// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { ComplianceMock, IAsset, IdentityRegistryMock, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";

const name = "TEST";
const symbol = "TAC";
const decimals = 6;
const isin = isinGenerator();
const AMOUNT = 1000;
const BALANCE_OF_C_ORIGINAL = 2 * AMOUNT;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("MintFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let signer_F: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

  describe("Multi partition mode", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._CLEARING_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN an initialized token WHEN issue THEN fails with NotAllowedInMultiPartitionMode", async () => {
      expect(await asset.connect(signer_A).isIssuable()).to.be.true;
      await expect(
        asset.connect(signer_A).issue(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });
  });

  describe("Single partition mode (internal KYC)", () => {
    async function deploySinglePartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._ISSUER_ROLE, members: [signer_C.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._CLEARING_ROLE, members: [signer_B.address] },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    describe("Cap", () => {
      it("GIVEN a max supply WHEN issue more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
        await expect(
          asset.connect(signer_A).issue(signer_E.address, MAX_SUPPLY + 1, DATA),
        ).to.be.revertedWithCustomError(asset, "MaxSupplyReached");
      });
    });

    describe("ControlList", () => {
      it("GIVEN blocked accounts (to) USING WHITELIST WHEN issue THEN transaction fails with AccountIsBlocked", async () => {
        const newTokenFixture = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              internalKycActivated: true,
              isWhiteList: true,
            },
          },
        });

        const newAccessControl = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await newAccessControl.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await newAccessControl.grantRole(ATS_ROLES._KYC_ROLE, signer_B.address);
        await newAccessControl.grantRole(ATS_ROLES._SSI_MANAGER_ROLE, signer_A.address);

        const newSsiManagement = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await newSsiManagement.addIssuer(signer_E.address);

        const newKycFacet = asset.attach(newTokenFixture.diamond.target).connect(signer_B) as IAsset;
        await newKycFacet.grantKyc(signer_E.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_E.address);

        const newErc1594 = asset.attach(newTokenFixture.diamond.target).connect(signer_A) as IAsset;
        await expect(newErc1594.issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.issue(signer_C.address, AMOUNT, DATA);
        await asset.issue(signer_E.address, AMOUNT, DATA);
        await asset.connect(signer_E).increaseAllowance(signer_C.address, AMOUNT);
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN issue THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without issuer role WHEN issue THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).issue(signer_E.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });
    });

    describe("Kyc", () => {
      it("GIVEN non kyc account WHEN issue THEN transaction reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(asset.issue(signer_E.address, AMOUNT, DATA)).to.revertedWithCustomError(asset, "InvalidKycStatus");
      });
    });

    it("GIVEN an account with issuer role WHEN issue THEN transaction succeeds", async () => {
      expect(await asset.issue(signer_E.address, AMOUNT / 2, DATA))
        .to.emit(asset, "Issued")
        .withArgs(signer_C.address, signer_E.address, AMOUNT / 2);
      expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
    });
  });

  describe("ERC3643 Single partition mode", () => {
    async function deploySecurityFixtureSinglePartition() {
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
            erc20MetadataInfo: { name, symbol, decimals, isin },
          },
        },
        infrastructure,
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;
      signer_F = base.user5;

      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._ISSUER_ROLE, members: [signer_C.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._AGENT_ROLE, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES._PAUSER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    it("GIVEN an account with issuer role WHEN mint THEN transaction succeeds", async () => {
      expect(await asset.mint(signer_E.address, AMOUNT / 2))
        .to.emit(asset, "Issued")
        .withArgs(signer_C.address, signer_E.address, AMOUNT / 2);
      expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
    });

    it("GIVEN a paused token WHEN attempting to mint TokenIsPaused error", async () => {
      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_B).pause();

      await expect(asset.mint(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a max supply WHEN mint more than the max supply THEN transaction fails with MaxSupplyReached", async () => {
      await expect(asset.connect(signer_A).mint(signer_E.address, MAX_SUPPLY + 1)).to.be.revertedWithCustomError(
        asset,
        "MaxSupplyReached",
      );
    });

    it("GIVEN blocked account USING WHITELIST WHEN mint THEN transaction fails with AccountIsBlocked", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
      await asset.connect(signer_A).addToControlList(signer_C.address);

      await asset.addIssuer(signer_C.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_C.address);

      await expect(asset.connect(signer_C).mint(signer_C.address, AMOUNT)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });

    it("GIVEN non kyc account WHEN mint THEN transaction reverts with InvalidKycStatus", async () => {
      await asset.connect(signer_B).revokeKyc(signer_E.address);
      await expect(asset.mint(signer_E.address, AMOUNT)).to.revertedWithCustomError(asset, "InvalidKycStatus");
    });
  });
});
