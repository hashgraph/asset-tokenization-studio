import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { type ResolverProxy, Pause, FixedRate } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DEFAULT_BOND_FIXED_RATE_PARAMS, deployBondFixedRateTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Fixed Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;

  let fixedRateFacet: FixedRate;
  let pauseFacet: Pause;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondFixedRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    fixedRateFacet = await ethers.getContractAt("FixedRate", diamond.address, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.address, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(fixedRateFacet.initialize_FixedRate({ rate: 1, rateDecimals: 0 })).to.be.rejectedWith(
      "AlreadyInitialized",
    );
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setFixedRate THEN transaction fails with TokenIsPaused", async () => {
      // transfer with data fails
      await expect(fixedRateFacet.connect(signer_A).setRate(1, 2)).to.be.rejectedWith("TokenIsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without interest rate manager role WHEN setFixedRate THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(fixedRateFacet.connect(signer_C).setRate(1, 2)).to.be.rejectedWith("AccountHasNoRole");
    });
  });

  describe("New Interest Rate OK", () => {
    it("GIVEN a token WHEN setFixedRate THEN transaction succeeds", async () => {
      const newRate = 355;
      const newRateDecimals = 3;

      const oldRateValues = await fixedRateFacet.getRate();

      await expect(fixedRateFacet.connect(signer_A).setRate(newRate, newRateDecimals))
        .to.emit(fixedRateFacet, "RateUpdated")
        .withArgs(signer_A.address, newRate, newRateDecimals);

      const newRateValues = await fixedRateFacet.getRate();

      expect(oldRateValues.rate_).to.equal(DEFAULT_BOND_FIXED_RATE_PARAMS.rate);
      expect(oldRateValues.decimals_).to.equal(DEFAULT_BOND_FIXED_RATE_PARAMS.rateDecimals);
      expect(newRateValues.rate_).to.equal(newRate);
      expect(newRateValues.decimals_).to.equal(newRateDecimals);
    });
  });
});
