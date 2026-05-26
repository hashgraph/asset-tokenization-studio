// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { deployEquityTokenFixture } from "@test";
import { ATS_ROLES, EIP712_RESOLVER_KEY } from "@scripts";

describe("EIP712 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let nonAdmin: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    nonAdmin = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
  });

  describe("Single Partition", () => {
    describe("Domain Separator", () => {
      it("GIVEN a deployed contract WHEN DOMAIN_SEPARATOR is called THEN the correct domain separator is returned", async () => {
        const domainSeparator = await asset.DOMAIN_SEPARATOR();
        const CONTRACT_NAME = (await asset.getERC20Metadata()).info.name;
        const CONTRACT_VERSION = (await asset.getConfigInfo()).version_.toString();
        const domain = {
          name: CONTRACT_NAME,
          version: CONTRACT_VERSION,
          chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
          verifyingContract: diamond.target as string,
        };
        const domainHash = ethers.TypedDataEncoder.hashDomain(domain);
        expect(domainSeparator).to.equal(domainHash);
      });
    });
  });

  describe("initializeEIP712", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeEIP712 is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(nonAdmin).initializeEIP712())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(nonAdmin.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeEIP712 is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeEIP712())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(EIP712_RESOLVER_KEY, 1);
    });
  });

  describe("initializeEIP712 event", () => {
    it("GIVEN a fresh deployment WHEN initializeEIP712 is called THEN emits EIP712Initialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(EIP712_RESOLVER_KEY);
      await expect(asset.initializeEIP712()).to.emit(asset, "EIP712Initialized");
    });
  });
});
