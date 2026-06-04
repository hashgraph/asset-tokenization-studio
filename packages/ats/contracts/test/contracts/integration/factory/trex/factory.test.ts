// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TREXFactoryAts, ITREXFactory, IFactory } from "@contract-types";

import { deployFullSuiteFixture } from "./fixtures/deploy-full-suite.fixture";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFixture } from "@test";
import { ADDRESS_ZERO } from "@scripts";

describe("TREX Factory Tests", () => {
  let deployer: HardhatEthersSigner;

  const name = "ATS-TREX-Token";
  const symbol = "ATS-TREX";
  const decimals = 6;

  let factoryAts: TREXFactoryAts;
  const tokenDetails: ITREXFactory.TokenDetailsStruct = {} as ITREXFactory.TokenDetailsStruct;
  const claimDetails: ITREXFactory.ClaimDetailsStruct = {} as ITREXFactory.ClaimDetailsStruct;
  let trexDeployment: Awaited<ReturnType<typeof deployFullSuiteFixture>>;

  let factory: IFactory;

  async function deployAtsFactoryFixture() {
    const base = await deployAtsInfrastructureFixture();
    factory = base.factory;
    deployer = base.deployer;
  }

  async function deployTrexSuiteFixture() {
    trexDeployment = await deployFullSuiteFixture();

    factoryAts = await (
      await ethers.getContractFactory("TREXFactoryAts", {
        signer: deployer,
      })
    ).deploy(
      trexDeployment.authorities.trexImplementationAuthority.target,
      await trexDeployment.factories.identityFactory.getAddress(),
      {},
    );
    await factoryAts.waitForDeployment();

    await (
      trexDeployment.factories.identityFactory.connect(deployer) as unknown as {
        addTokenFactory: (address: string) => Promise<void>;
      }
    ).addTokenFactory(await factoryAts.getAddress());

    tokenDetails.name = name;
    tokenDetails.symbol = symbol;
    tokenDetails.decimals = decimals;
    tokenDetails.ONCHAINID = ADDRESS_ZERO;
    tokenDetails.owner = deployer.address;
    tokenDetails.irAgents = [deployer.address];
    tokenDetails.irs = ADDRESS_ZERO;
    tokenDetails.tokenAgents = [deployer.address];
    tokenDetails.complianceModules = [];
    tokenDetails.complianceSettings = [];

    claimDetails.claimTopics = [];
    claimDetails.issuerClaims = [];
    claimDetails.issuers = [];
  }

  beforeEach(async () => {
    await loadFixture(deployAtsFactoryFixture);
    await loadFixture(deployTrexSuiteFixture);
  });

  describe("Disabled deployTREXSuite", () => {
    it("GIVEN any parameters WHEN calling deployTREXSuite THEN it does nothing (disabled)", async () => {
      await factoryAts.connect(deployer).deployTREXSuite("test-salt", tokenDetails, claimDetails);
    });
  });

  describe("Administrative functions tests", () => {
    let otherAccount: HardhatEthersSigner;

    beforeEach(async () => {
      [, otherAccount] = await ethers.getSigners();
    });

    describe("recoverContractOwnership", () => {
      it("GIVEN non-owner caller WHEN calling recoverContractOwnership THEN transaction reverts", async () => {
        await expect(
          factoryAts.connect(otherAccount).recoverContractOwnership(factory.target, otherAccount.address),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN owner caller WHEN calling recoverContractOwnership THEN ownership is transferred", async () => {
        // Deploy a mock ownable contract
        const MockOwnable = await ethers.getContractFactory("TREXFactoryAts");
        const mockContract = await MockOwnable.connect(deployer).deploy(
          trexDeployment.authorities.trexImplementationAuthority.target,
          await trexDeployment.factories.identityFactory.getAddress(),
        );
        await mockContract.waitForDeployment();

        // Transfer ownership to factory first
        await mockContract.transferOwnership(factoryAts.target);

        // Recover ownership using factoryAts
        await factoryAts.connect(deployer).recoverContractOwnership(mockContract.target, otherAccount.address);

        expect(await mockContract.owner()).to.equal(otherAccount.address);
      });
    });

    describe("setImplementationAuthority", () => {
      it("GIVEN non-owner caller WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        await expect(
          factoryAts
            .connect(otherAccount)
            .setImplementationAuthority(trexDeployment.authorities.trexImplementationAuthority.target),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN zero address WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        await expect(factoryAts.connect(deployer).setImplementationAuthority(ADDRESS_ZERO)).to.be.revertedWith(
          "invalid argument - zero address",
        );
      });

      it("GIVEN incomplete implementation authority WHEN calling setImplementationAuthority THEN transaction reverts", async () => {
        // Deploy a mock incomplete implementation authority
        const IncompleteAuthority = await ethers.getContractFactory("MockIncompleteImplementationAuthority");
        const incompleteAuthority = await IncompleteAuthority.deploy();
        await incompleteAuthority.waitForDeployment();

        await expect(
          factoryAts.connect(deployer).setImplementationAuthority(incompleteAuthority.target),
        ).to.be.revertedWith("invalid Implementation Authority");
      });

      it("GIVEN valid implementation authority WHEN calling setImplementationAuthority THEN authority is set and event is emitted", async () => {
        const newAuthority = trexDeployment.authorities.trexImplementationAuthority.target;

        const tx = await factoryAts.connect(deployer).setImplementationAuthority(newAuthority);

        expect(await factoryAts.getImplementationAuthority()).to.equal(newAuthority);
        await expect(tx).to.emit(factoryAts, "ImplementationAuthoritySet").withArgs(newAuthority);
      });
    });

    describe("setIdFactory", () => {
      it("GIVEN non-owner caller WHEN calling setIdFactory THEN transaction reverts", async () => {
        await expect(
          factoryAts.connect(otherAccount).setIdFactory(await trexDeployment.factories.identityFactory.getAddress()),
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("GIVEN zero address WHEN calling setIdFactory THEN transaction reverts", async () => {
        await expect(factoryAts.connect(deployer).setIdFactory(ADDRESS_ZERO)).to.be.revertedWith(
          "invalid argument - zero address",
        );
      });

      it("GIVEN valid id factory address WHEN calling setIdFactory THEN factory is set and event is emitted", async () => {
        const newIdFactory = await trexDeployment.factories.identityFactory.getAddress();

        const tx = await factoryAts.connect(deployer).setIdFactory(newIdFactory);

        expect(await factoryAts.getIdFactory()).to.equal(newIdFactory);
        await expect(tx).to.emit(factoryAts, "IdFactorySet").withArgs(newIdFactory);
      });
    });

    describe("Getter functions", () => {
      it("GIVEN deployed factory WHEN calling getImplementationAuthority THEN correct address is returned", async () => {
        const authority = await factoryAts.getImplementationAuthority();
        expect(authority).to.equal(trexDeployment.authorities.trexImplementationAuthority.target);
      });

      it("GIVEN deployed factory WHEN calling getIdFactory THEN correct address is returned", async () => {
        const idFactory = await factoryAts.getIdFactory();
        expect(idFactory).to.equal(trexDeployment.factories.identityFactory.target);
      });

      it("GIVEN non-existent salt WHEN calling getToken THEN zero address is returned", async () => {
        const tokenAddress = await factoryAts.getToken("non-existent-salt");
        expect(tokenAddress).to.equal(ADDRESS_ZERO);
      });
    });
  });
});
