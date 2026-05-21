// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("EIP712 Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let nonAdmin: HardhatEthersSigner;

  let asset: IAsset;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    nonAdmin = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
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
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeEIP712 is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(nonAdmin).initializeEIP712()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeEIP712 is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeEIP712();
      await expect(freshAsset.connect(infra.deployer).initializeEIP712()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeEIP712 is called THEN it emits EIP712Initialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeEIP712()).to.emit(freshAsset, "EIP712Initialized");
    });
  });
});
