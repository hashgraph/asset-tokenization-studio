import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  PauseFacet,
  SustainabilityPerformanceTargetRateFacet,
  ProceedRecipientsFacet,
} from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS,
  deployBondSustainabilityPerformanceTargetRateTokenFixture,
} from "@test";
import { executeRbac } from "@test";
import { BigNumber } from "ethers";

describe("Sustainability Performance Target Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let project1: string;
  let project2: string;

  let sustainabilityPerformanceTargetRateFacet: SustainabilityPerformanceTargetRateFacet;
  let pauseFacet: PauseFacet;
  let proceedRecipientsFacet: ProceedRecipientsFacet;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondSustainabilityPerformanceTargetRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    // Set up projects
    project1 = signer_A.address;
    project2 = signer_B.address;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    sustainabilityPerformanceTargetRateFacet = await ethers.getContractAt(
      "SustainabilityPerformanceTargetRateFacet",
      diamond.address,
      signer_A,
    );
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.address, signer_A);
    proceedRecipientsFacet = await ethers.getContractAt("ProceedRecipientsFacet", diamond.address, signer_A);

    await proceedRecipientsFacet.connect(signer_A).addProceedRecipient(project1, "0x");
    await proceedRecipientsFacet.connect(signer_A).addProceedRecipient(project2, "0x");
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(
      sustainabilityPerformanceTargetRateFacet.initialize_SustainabilityPerformanceTargetRate(
        {
          baseRate: 50,
          startPeriod: 1000,
          startRate: 50,
          rateDecimals: 1,
        },
        [
          {
            baseLine: 750,
            baseLineMode: 0,
            deltaRate: 10,
            impactDataMode: 0,
          },
        ],
        [project1],
      ),
    ).to.be.rejectedWith("AlreadyInitialized");
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setInterestRate THEN transaction fails with TokenIsPaused", async () => {
      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_A).setInterestRate({
          baseRate: 60,
          startPeriod: 2000,
          startRate: 60,
          rateDecimals: 2,
        }),
      ).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN a paused Token WHEN setImpactData THEN transaction fails with TokenIsPaused", async () => {
      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 800,
              baseLineMode: 0,
              deltaRate: 15,
              impactDataMode: 0,
            },
          ],
          [project1],
        ),
      ).to.be.rejectedWith("TokenIsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without interest rate manager role WHEN setInterestRate THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_C).setInterestRate({
          baseRate: 60,
          startPeriod: 2000,
          startRate: 60,
          rateDecimals: 2,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account without interest rate manager role WHEN setImpactData THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_C).setImpactData(
          [
            {
              baseLine: 800,
              baseLineMode: 0,
              deltaRate: 15,
              impactDataMode: 0,
            },
          ],
          [project1],
        ),
      ).to.be.rejectedWith("AccountHasNoRole");
    });
  });

  describe("Interest Rate", () => {
    it("GIVEN correct interest rate WHEN setInterestRate THEN transaction succeeds", async () => {
      const newInterestRate = {
        baseRate: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.baseRate + 10,
        startPeriod: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.startPeriod + 1000,
        startRate: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.startRate + 10,
        rateDecimals: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.rateDecimals + 1,
      };

      await expect(sustainabilityPerformanceTargetRateFacet.connect(signer_A).setInterestRate(newInterestRate))
        .to.emit(sustainabilityPerformanceTargetRateFacet, "InterestRateUpdated")
        .withArgs(signer_A.address, [
          newInterestRate.baseRate,
          newInterestRate.startPeriod,
          newInterestRate.startRate,
          newInterestRate.rateDecimals,
        ]);

      const interestRate = await sustainabilityPerformanceTargetRateFacet.getInterestRate();

      expect(interestRate.baseRate).to.equal(newInterestRate.baseRate);
      expect(interestRate.startPeriod).to.equal(newInterestRate.startPeriod);
      expect(interestRate.startRate).to.equal(newInterestRate.startRate);
      expect(interestRate.rateDecimals).to.equal(newInterestRate.rateDecimals);
    });
  });

  describe("Impact Data", () => {
    it("GIVEN mismatched array lengths WHEN setImpactData THEN transaction fails with ProvidedListsLengthMismatch", async () => {
      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 800,
              baseLineMode: 0,
              deltaRate: 15,
              impactDataMode: 0,
            },
            {
              baseLine: 900,
              baseLineMode: 1,
              deltaRate: 20,
              impactDataMode: 1,
            },
          ],
          [project1], // Only one project but two impact data entries
        ),
      ).to.be.rejectedWith("ProvidedListsLengthMismatch");
    });

    it("GIVEN non-existing project WHEN setImpactData THEN transaction fails with NotExistingProject", async () => {
      const nonExistingProject = "0x0000000000000000000000000000000000000099";

      await expect(
        sustainabilityPerformanceTargetRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 800,
              baseLineMode: 0,
              deltaRate: 15,
              impactDataMode: 0,
            },
          ],
          [nonExistingProject],
        ),
      ).to.be.rejectedWith("NotExistingProject");
    });

    it("GIVEN correct impact data for existing project WHEN setImpactData THEN transaction succeeds", async () => {
      const newImpactData = [
        {
          baseLine: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.baseLine + 100,
          baseLineMode: 1, // MAXIMUM
          deltaRate: DEFAULT_BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_PARAMS.deltaRate + 5,
          impactDataMode: 1, // BONUS
        },
      ];

      const tx = await sustainabilityPerformanceTargetRateFacet
        .connect(signer_A)
        .setImpactData(newImpactData, [project1]);

      const receipt = await tx.wait();

      const event = receipt.events!.find((e) => e.event === "ImpactDataUpdated")!;

      const decoded = event.args!.newImpactData[0];
      const operator = event.args!.operator;
      const projects = event.args!.projects;

      expect(operator).to.equal(signer_A.address);
      expect(projects[0]).to.equal(project1);

      expect(decoded.baseLine).to.equal(newImpactData[0].baseLine);
      expect(decoded.baseLineMode).to.equal(newImpactData[0].baseLineMode);
      expect(decoded.deltaRate).to.equal(newImpactData[0].deltaRate);
      expect(decoded.impactDataMode).to.equal(newImpactData[0].impactDataMode);

      const impactData = await sustainabilityPerformanceTargetRateFacet.getImpactDataFor(project1);

      expect(impactData.baseLine).to.equal(newImpactData[0].baseLine);
      expect(impactData.baseLineMode).to.equal(newImpactData[0].baseLineMode);
      expect(impactData.deltaRate).to.equal(newImpactData[0].deltaRate);
      expect(impactData.impactDataMode).to.equal(newImpactData[0].impactDataMode);
    });

    it("GIVEN multiple projects WHEN setImpactData THEN transaction succeeds for all", async () => {
      const newImpactData = [
        {
          baseLine: 800,
          baseLineMode: 0, // MINIMUM
          deltaRate: 15,
          impactDataMode: 0, // PENALTY
        },
        {
          baseLine: 900,
          baseLineMode: 1, // MAXIMUM
          deltaRate: 20,
          impactDataMode: 1, // BONUS
        },
      ];

      const tx = await sustainabilityPerformanceTargetRateFacet
        .connect(signer_A)
        .setImpactData(newImpactData, [project1, project2]);

      const receipt = await tx.wait();

      const event = receipt.events!.find((e) => e.event === "ImpactDataUpdated")!;

      const decoded_0 = event.args!.newImpactData[0];
      const decoded_1 = event.args!.newImpactData[1];
      const operator = event.args!.operator;
      const projects = event.args!.projects;

      expect(operator).to.equal(signer_A.address);
      expect(projects[0]).to.equal(project1);
      expect(projects[1]).to.equal(project2);

      expect(decoded_0.baseLine).to.equal(newImpactData[0].baseLine);
      expect(decoded_0.baseLineMode).to.equal(newImpactData[0].baseLineMode);
      expect(decoded_0.deltaRate).to.equal(newImpactData[0].deltaRate);
      expect(decoded_0.impactDataMode).to.equal(newImpactData[0].impactDataMode);

      expect(decoded_1.baseLine).to.equal(newImpactData[1].baseLine);
      expect(decoded_1.baseLineMode).to.equal(newImpactData[1].baseLineMode);
      expect(decoded_1.deltaRate).to.equal(newImpactData[1].deltaRate);
      expect(decoded_1.impactDataMode).to.equal(newImpactData[1].impactDataMode);

      const impactData1 = await sustainabilityPerformanceTargetRateFacet.getImpactDataFor(project1);
      expect(impactData1.baseLine).to.equal(newImpactData[0].baseLine);
      expect(impactData1.baseLineMode).to.equal(newImpactData[0].baseLineMode);
      expect(impactData1.deltaRate).to.equal(newImpactData[0].deltaRate);
      expect(impactData1.impactDataMode).to.equal(newImpactData[0].impactDataMode);

      const impactData2 = await sustainabilityPerformanceTargetRateFacet.getImpactDataFor(project2);
      expect(impactData2.baseLine).to.equal(newImpactData[1].baseLine);
      expect(impactData2.baseLineMode).to.equal(newImpactData[1].baseLineMode);
      expect(impactData2.deltaRate).to.equal(newImpactData[1].deltaRate);
      expect(impactData2.impactDataMode).to.equal(newImpactData[1].impactDataMode);
    });
  });
});
