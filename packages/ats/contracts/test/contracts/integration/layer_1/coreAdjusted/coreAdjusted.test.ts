// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac } from "@test";

const decimals = 6;
const decimalAdjustment = 2;
const adjustmentTimestamp = 100_000;

describe("CoreAdjusted Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;

  let asset: IAsset;

  async function deployFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          erc20MetadataInfo: { name: "TEST_CoreAdjusted", symbol: "TCA", decimals, isin: "US0378331005" },
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.CORPORATE_ACTION_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, members: [signer_A.address] },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("decimalsAt", () => {
    it("GIVEN an initialized token WHEN decimalsAt is called with current timestamp THEN returns current decimals", async () => {
      const currentTimestamp = await asset.blockTimestamp();

      expect(await asset.decimalsAt(currentTimestamp)).to.equal(decimals);
    });

    it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp after the adjustment THEN returns adjusted decimals", async () => {
      await asset.setScheduledBalanceAdjustment({
        executionDate: adjustmentTimestamp,
        factor: 100,
        decimals: decimalAdjustment,
      });

      expect(await asset.decimalsAt(adjustmentTimestamp + 1)).to.equal(decimals + decimalAdjustment);
    });

    it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp before the adjustment THEN returns original decimals", async () => {
      await asset.setScheduledBalanceAdjustment({
        executionDate: adjustmentTimestamp,
        factor: 100,
        decimals: decimalAdjustment,
      });

      expect(await asset.decimalsAt(adjustmentTimestamp - 1)).to.equal(decimals);
    });
  });
  describe("initializeCoreAdjusted", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeCoreAdjusted is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_B).initializeCoreAdjusted()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeCoreAdjusted is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeCoreAdjusted();
      await expect(freshAsset.connect(infra.deployer).initializeCoreAdjusted()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeCoreAdjusted is called THEN it emits CoreAdjustedInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeCoreAdjusted()).to.emit(
        freshAsset,
        "CoreAdjustedInitialized",
      );
    });
  });
});
