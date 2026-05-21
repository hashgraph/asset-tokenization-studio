// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GAS_LIMIT, ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";
import { type ResolverProxy, type IAsset, MockedExternalPause } from "@contract-types";
import { Signer } from "ethers";
import { ethers } from "hardhat";

describe("Pause Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;
  let deployer: HardhatEthersSigner;
  let unknownSigner: Signer;
  let externalPauseMock: MockedExternalPause;

  // Fixture: Deploy equity token with external pause mock
  async function deployEquityWithExternalPauseFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    asset = await ethers.getContractAt("IAsset", diamond.target);

    // Deploy mock external pause contract
    externalPauseMock = await (
      await ethers.getContractFactory("MockedExternalPause", base.deployer)
    ).deploy({ gasLimit: GAS_LIMIT.high });
    await externalPauseMock.waitForDeployment();

    // Add external pause to the token
    await asset.connect(base.deployer).grantRole(ATS_ROLES.PAUSER_ROLE, base.deployer.address);
    await asset.connect(base.deployer).grantRole(ATS_ROLES.PAUSE_MANAGER_ROLE, base.deployer.address);
    await asset.connect(base.deployer).addExternalPause(externalPauseMock.target, {
      gasLimit: GAS_LIMIT.high,
    });

    deployer = base.deployer;
    unknownSigner = base.unknownSigner;
  }

  // Pre-load fixture to separate deployment time from test execution time
  beforeEach(async () => {
    await loadFixture(deployEquityWithExternalPauseFixture);
  });

  it("GIVEN an account without pause role WHEN pause THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(unknownSigner).pause()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });

  it("GIVEN an account without pause role WHEN unpause THEN transaction fails with AccountHasNoRole", async () => {
    await expect(asset.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN pause THEN transaction fails with IsPaused", async () => {
    // Granting Role and Pause
    await grantRoleAndPauseToken(
      asset,
      ATS_ROLES.PAUSER_ROLE,
      deployer,
      unknownSigner,
      await unknownSigner.getAddress(),
    );

    // pause fails
    await expect(asset.connect(unknownSigner).pause()).to.be.revertedWithCustomError(asset, "IsPaused");
  });

  it("GIVEN an unpause Token WHEN unpause THEN transaction fails with IsUnpaused", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES.PAUSER_ROLE, await unknownSigner.getAddress());

    // unpause fails
    await expect(asset.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(asset, "IsUnpaused");
  });

  it("GIVEN an account with pause role WHEN pause and unpause THEN transaction succeeds", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES.PAUSER_ROLE, await unknownSigner.getAddress());

    // PAUSE
    await expect(asset.connect(unknownSigner).pause())
      .to.emit(asset, "Paused")
      .withArgs(await unknownSigner.getAddress());

    let paused = await asset.paused();
    expect(paused).to.be.equal(true);

    // UNPAUSE
    await expect(asset.connect(unknownSigner).unpause())
      .to.emit(asset, "Unpaused")
      .withArgs(await unknownSigner.getAddress());

    paused = await asset.paused();
    expect(paused).to.be.equal(false);
  });

  it("GIVEN an external pause WHEN isPaused THEN it reflects the external pause state", async () => {
    // Initially unpaused
    let isPaused = await asset.paused();
    expect(isPaused).to.be.false;

    // Set external pause to true
    await externalPauseMock.setPaused(true);
    isPaused = await asset.paused();
    expect(isPaused).to.be.true;

    // Set external pause to false
    await externalPauseMock.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    isPaused = await asset.paused();
    expect(isPaused).to.be.false;
  });

  it("GIVEN an external pause WHEN token is paused THEN isPaused returns true", async () => {
    // Pause the token
    await asset.pause();

    // Check isPaused
    const isPaused = await asset.paused();
    expect(isPaused).to.be.true;
  });

  it("GIVEN an external pause WHEN token is unpaused THEN isPaused reflects external pause state", async () => {
    // Pause and then unpause the token
    await asset.pause();
    await asset.unpause();

    // Set external pause to true
    await externalPauseMock.setPaused(true);
    let isPaused = await asset.paused();
    expect(isPaused).to.be.true;

    // Set external pause to false
    await externalPauseMock.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    isPaused = await asset.paused();
    expect(isPaused).to.be.false;
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN pause THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).pause()).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN unpause THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).unpause()).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });
  });

  describe("initializePause", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializePause is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(unknownSigner).initializePause()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializePause is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializePause();
      await expect(freshAsset.connect(infra.deployer).initializePause()).to.be.revertedWithCustomError(
        freshAsset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializePause is called THEN it emits PauseInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializePause()).to.emit(freshAsset, "PauseInitialized");
    });
  });
});
