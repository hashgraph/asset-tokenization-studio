// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GAS_LIMIT, ATS_ROLES } from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { deployEquityTokenFixture } from "@test";
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
    await asset.connect(base.deployer).grantRole(ATS_ROLES._PAUSER_ROLE, base.deployer.address);
    await asset.connect(base.deployer).grantRole(ATS_ROLES._PAUSE_MANAGER_ROLE, base.deployer.address);
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

  it("GIVEN a paused Token WHEN pause THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role and Pause
    await grantRoleAndPauseToken(
      asset,
      ATS_ROLES._PAUSER_ROLE,
      deployer,
      unknownSigner,
      await unknownSigner.getAddress(),
    );

    // pause fails
    await expect(asset.connect(unknownSigner).pause()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
  });

  it("GIVEN an unpause Token WHEN unpause THEN transaction fails with TokenIsUnpaused", async () => {
    await asset.connect(deployer).grantRole(ATS_ROLES._PAUSER_ROLE, await unknownSigner.getAddress());

    // unpause fails
    await expect(asset.connect(unknownSigner).unpause()).to.be.revertedWithCustomError(asset, "TokenIsUnpaused");
  });

  it("GIVEN an account with pause role WHEN pause and unpause THEN transaction succeeds", async () => {
    // Granting Role
    await asset.connect(deployer).grantRole(ATS_ROLES._PAUSER_ROLE, await unknownSigner.getAddress());

    // PAUSE
    await expect(asset.connect(unknownSigner).pause())
      .to.emit(asset, "TokenPaused")
      .withArgs(await unknownSigner.getAddress());

    let paused = await asset.isPaused();
    expect(paused).to.be.equal(true);

    // UNPAUSE
    await expect(asset.connect(unknownSigner).unpause())
      .to.emit(asset, "TokenUnpaused")
      .withArgs(await unknownSigner.getAddress());

    paused = await asset.isPaused();
    expect(paused).to.be.equal(false);
  });

  it("GIVEN an external pause WHEN isPaused THEN it reflects the external pause state", async () => {
    // Initially unpaused
    let isPaused = await asset.isPaused();
    expect(isPaused).to.be.false;

    // Set external pause to true
    await externalPauseMock.setPaused(true);
    isPaused = await asset.isPaused();
    expect(isPaused).to.be.true;

    // Set external pause to false
    await externalPauseMock.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    isPaused = await asset.isPaused();
    expect(isPaused).to.be.false;
  });

  it("GIVEN an external pause WHEN token is paused THEN isPaused returns true", async () => {
    // Pause the token
    await asset.pause();

    // Check isPaused
    const isPaused = await asset.isPaused();
    expect(isPaused).to.be.true;
  });

  it("GIVEN an external pause WHEN token is unpaused THEN isPaused reflects external pause state", async () => {
    // Pause and then unpause the token
    await asset.pause();
    await asset.unpause();

    // Set external pause to true
    await externalPauseMock.setPaused(true);
    let isPaused = await asset.isPaused();
    expect(isPaused).to.be.true;

    // Set external pause to false
    await externalPauseMock.setPaused(false, {
      gasLimit: GAS_LIMIT.default,
    });
    isPaused = await asset.isPaused();
    expect(isPaused).to.be.false;
  });
});
