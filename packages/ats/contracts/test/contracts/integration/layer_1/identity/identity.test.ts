// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { isinGenerator } from "@thomaschaplin/isin-generator";
import { ComplianceMock, IdentityRegistryMock, type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEY_IDENTITY } from "@scripts";
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
  let unknownSigner: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

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
    const signers = await ethers.getSigners();
    unknownSigner = signers[signers.length - 1];

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_TREX_OWNER,
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
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setOnchainID(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN setIdentityRegistry THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setIdentityRegistry(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe("initializeIdentity", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeIdentity THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeIdentity(ADDRESS_ZERO))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeIdentity THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeIdentity(ADDRESS_ZERO))
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_IDENTITY, 1);
    });
  });

  describe("initializeIdentity event", () => {
    it("GIVEN fresh facet WHEN initializeIdentity THEN emits IdentityInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_IDENTITY);
      await expect(asset.initializeIdentity(ADDRESS_ZERO)).to.emit(asset, "IdentityInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setOnchainID THEN AssetNotOperational", async () => {
      await expect(asset.setOnchainID(ethers.Wallet.createRandom().address)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN setIdentityRegistry THEN AssetNotOperational", async () => {
      await expect(asset.setIdentityRegistry(ethers.Wallet.createRandom().address)).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });
});
