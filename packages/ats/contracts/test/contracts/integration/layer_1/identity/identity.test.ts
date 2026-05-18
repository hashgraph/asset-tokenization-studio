// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { ComplianceMock, IdentityRegistryMock, type ResolverProxy, type IAsset } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac } from "@test";

const name = "TEST";
const symbol = "TAC";
const decimals = 6;
const version = "1";
const isin = isinGenerator();
const MAX_SUPPLY = 10000000;
const onchainId = ethers.Wallet.createRandom().address;

describe("Identity Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  let identityRegistryMock: IdentityRegistryMock;
  let complianceMock: ComplianceMock;

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

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.TREX_OWNER_ROLE,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  describe("setOnchainID", () => {
    it("GIVEN an initialized token WHEN updating the onChanId THEN UpdatedTokenInformation emits OnchainIDUpdated with updated onchainId and current metadata", async () => {
      const retrieved_onChainId = await asset.onchainID();
      expect(retrieved_onChainId).to.equal(ADDRESS_ZERO);

      expect(await asset.setOnchainID(onchainId))
        .to.emit(asset, "UpdatedTokenInformation")
        .withArgs(name, symbol, decimals, version, onchainId);

      const retrieved_newOnChainId = await asset.onchainID();
      expect(retrieved_newOnChainId).to.equal(onchainId);
    });

    it("GIVEN an account without TREX_OWNER role WHEN setOnchainID THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).setOnchainID(onchainId)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused token WHEN setOnchainID THEN transactions revert with IsPaused error", async () => {
      await asset.connect(signer_B).pause();

      await expect(asset.setOnchainID(onchainId)).to.be.revertedWithCustomError(asset, "IsPaused");
    });
  });

  describe("setIdentityRegistry", () => {
    it("GIVEN an initialized token WHEN updating the identityRegistry THEN setIdentityRegistry emits IdentityRegistryAdded with updated identityRegistry", async () => {
      const retrieved_identityRegistry = await asset.identityRegistry();
      expect(retrieved_identityRegistry).to.equal(identityRegistryMock.target as string);

      expect(await asset.setIdentityRegistry(identityRegistryMock.target as string))
        .to.emit(asset, "IdentityRegistryAdded")
        .withArgs(identityRegistryMock.target as string);

      const retrieved_newIdentityRegistry = await asset.identityRegistry();
      expect(retrieved_newIdentityRegistry).to.equal(identityRegistryMock.target as string);
    });

    it("GIVEN an account without TREX_OWNER role WHEN setIdentityRegistry THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_C).setIdentityRegistry(identityRegistryMock.target as string),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused token WHEN setIdentityRegistry THEN transactions revert with IsPaused error", async () => {
      await asset.connect(signer_B).pause();

      await expect(asset.setIdentityRegistry(identityRegistryMock.target as string)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setOnchainID THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setOnchainID(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
