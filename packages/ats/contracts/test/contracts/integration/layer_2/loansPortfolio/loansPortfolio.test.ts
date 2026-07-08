// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockLoanHolding__factory } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, DEFAULT_PARTITION } from "@scripts";
import { HoldingsAssetType, getFacetDefinition } from "@scripts/domain";
import { executeRbac } from "@test";

export function loansPortfolioTests(getCtx: () => AssetMockCtx): void {
  describe("LoansPortfolio Token Tests", () => {
    // Sourced from the generated registry (single source of truth, derived from
    // contracts/facets/loansPortfolio/ILoansPortfolio.sol) rather than a hand-maintained copy.
    const loansPortfolioResolverKey = getFacetDefinition("LoansPortfolioFacet")?.resolverKey?.value;
    if (!loansPortfolioResolverKey) {
      throw new Error("LoansPortfolioFacet resolver key missing from the registry");
    }
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      asset = ctx.asset as IAssetMock;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_LOANS_PORTFOLIO_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_DEACTIVATE, members: [signer_A.address] },
      ]);

      await asset.forceFacetNotRegistered(loansPortfolioResolverKey);
      await asset.initializeLoansPortfolio({ portfolioType: 1, distributionPolicy: 1 });
    });

    describe("initializeLoansPortfolio", () => {
      it("GIVEN a deployed portfolio WHEN initializing THEN state is set correctly", async () => {
        const data = await asset.getLoansPortfolioData();

        expect(data.portfolioType).to.equal(1);
        expect(data.distributionPolicy).to.equal(1);
      });

      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeLoansPortfolio is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).initializeLoansPortfolio({
            portfolioType: 1,
            distributionPolicy: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an already initialized portfolio WHEN initializing again THEN reverts with FacetAlreadyRegistered", async () => {
        await expect(
          asset.initializeLoansPortfolio({
            portfolioType: 1,
            distributionPolicy: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });

      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeLoansPortfolio is called THEN it emits LoansPortfolioInitialized", async () => {
        await asset.forceFacetNotRegistered(loansPortfolioResolverKey);
        const loansPortfolioData = {
          portfolioType: 1,
          distributionPolicy: 1,
        };
        await expect(asset.initializeLoansPortfolio(loansPortfolioData)).to.emit(asset, "LoansPortfolioInitialized");
      });
    });

    describe("addHoldingsAsset", () => {
      it("GIVEN a valid LOAN asset WHEN adding THEN asset is added and event emitted", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const holdingsAsset = {
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        };

        await expect(asset.addHoldingsAsset(holdingsAsset))
          .to.emit(asset, "HoldingsAssetAdded")
          .withArgs(Object.values(holdingsAsset));

        expect(await asset.getNumberOfAssets()).to.equal(1);
        expect(await asset.getNumberOfLoans()).to.equal(1);
        expect(await asset.getNumberOfCash()).to.equal(0);
      });

      it("GIVEN a valid CASH asset WHEN adding THEN asset is added and event emitted", async () => {
        const holdingsAsset = {
          assetAddress: signer_B.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        };

        await expect(asset.addHoldingsAsset(holdingsAsset))
          .to.emit(asset, "HoldingsAssetAdded")
          .withArgs(Object.values(holdingsAsset));

        expect(await asset.getNumberOfAssets()).to.equal(1);
        expect(await asset.getNumberOfLoans()).to.equal(0);
        expect(await asset.getNumberOfCash()).to.equal(1);
      });

      it("GIVEN NONE holdings type WHEN adding asset THEN reverts with HoldingsAssetTypeNotSupported", async () => {
        await expect(
          asset.addHoldingsAsset({
            assetAddress: signer_B.address,
            holdingsAssetType: HoldingsAssetType.NONE,
          }),
        )
          .to.be.revertedWithCustomError(asset, "HoldingsAssetTypeNotSupported")
          .withArgs(HoldingsAssetType.NONE);
      });

      it("GIVEN a zero address WHEN adding asset THEN reverts with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.addHoldingsAsset({
            assetAddress: ADDRESS_ZERO,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a paused portfolio WHEN adding asset THEN reverts with IsPaused", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.connect(signer_B).pause();

        await expect(
          asset.addHoldingsAsset({
            assetAddress: loan.target,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an unauthorized account WHEN adding asset THEN reverts with AccountHasNoRole", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await expect(
          asset.connect(signer_C).addHoldingsAsset({
            assetAddress: loan.target,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        )
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.ROLE_LOANS_PORTFOLIO_MANAGER);
      });

      it("GIVEN an existing asset WHEN adding the same asset THEN reverts with HoldingsAssetAlreadyExists", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const holdingsAsset = {
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        };
        await asset.addHoldingsAsset(holdingsAsset);

        await expect(asset.addHoldingsAsset(holdingsAsset))
          .to.be.revertedWithCustomError(asset, "HoldingsAssetAlreadyExists")
          .withArgs(loan.target);
      });
    });

    describe("removeHoldingsAsset", () => {
      it("GIVEN an existing LOAN asset WHEN removing THEN asset is removed and event emitted", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const holdingsAsset = {
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        };
        await asset.addHoldingsAsset(holdingsAsset);
        expect(await asset.getNumberOfLoans()).to.equal(1);

        await expect(asset.removeHoldingsAsset(holdingsAsset))
          .to.emit(asset, "HoldingsAssetRemoved")
          .withArgs(Object.values(holdingsAsset));

        expect(await asset.getNumberOfAssets()).to.equal(0);
        expect(await asset.getNumberOfLoans()).to.equal(0);
      });

      it("GIVEN an existing CASH asset WHEN removing THEN asset is removed and event emitted", async () => {
        const holdingsAsset = {
          assetAddress: signer_C.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        };
        await asset.addHoldingsAsset(holdingsAsset);

        await expect(asset.removeHoldingsAsset(holdingsAsset))
          .to.emit(asset, "HoldingsAssetRemoved")
          .withArgs(Object.values(holdingsAsset));

        expect(await asset.getNumberOfAssets()).to.equal(0);
        expect(await asset.getNumberOfCash()).to.equal(0);
      });

      it("GIVEN NONE holdings type WHEN adding asset THEN reverts with HoldingsAssetTypeNotSupported", async () => {
        await expect(
          asset.removeHoldingsAsset({
            assetAddress: signer_B.address,
            holdingsAssetType: HoldingsAssetType.NONE,
          }),
        )
          .to.be.revertedWithCustomError(asset, "HoldingsAssetTypeNotSupported")
          .withArgs(HoldingsAssetType.NONE);
      });

      it("GIVEN a non-existing LOAN asset WHEN removing THEN reverts with HoldingAssetNotFound", async () => {
        await expect(
          asset.removeHoldingsAsset({
            assetAddress: signer_C.address,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        )
          .to.be.revertedWithCustomError(asset, "HoldingAssetNotFound")
          .withArgs(signer_C.address);
      });

      it("GIVEN a non-existing CASH asset WHEN removing THEN reverts with HoldingAssetNotFound", async () => {
        await expect(
          asset.removeHoldingsAsset({
            assetAddress: signer_C.address,
            holdingsAssetType: HoldingsAssetType.CASH,
          }),
        )
          .to.be.revertedWithCustomError(asset, "HoldingAssetNotFound")
          .withArgs(signer_C.address);
      });

      it("GIVEN a zero address WHEN removing THEN reverts with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.removeHoldingsAsset({
            assetAddress: ADDRESS_ZERO,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a paused portfolio WHEN removing LOAN asset THEN reverts with IsPaused", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const holdingsAsset = {
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        };
        await asset.addHoldingsAsset(holdingsAsset);
        await asset.connect(signer_B).pause();

        await expect(asset.removeHoldingsAsset(holdingsAsset)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an unauthorized account WHEN removing LOAN asset THEN reverts with AccountHasNoRole", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const holdingsAsset = {
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        };
        await asset.addHoldingsAsset(holdingsAsset);

        await expect(asset.connect(signer_C).removeHoldingsAsset(holdingsAsset))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.ROLE_LOANS_PORTFOLIO_MANAGER);
      });
    });

    describe("notifyLoanHoldingsAssetUpdate", () => {
      it("GIVEN an added LOAN asset WHEN notifying update THEN event is emitted and categorization is refreshed", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;

        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        expect(await asset.getNumberOfPerformingLoans()).to.equal(1);

        await loan.setLoanState(0, 1);

        expect(await asset.getNumberOfPerformingLoans()).to.equal(1);
        expect(await asset.getNumberOfNonPerformingLoans()).to.equal(0);

        await expect(asset.notifyLoanHoldingsAssetUpdate(loanAddress))
          .to.emit(asset, "LoanHoldingsAssetUpdated")
          .withArgs(loanAddress);

        expect(await asset.getNumberOfPerformingLoans()).to.equal(0);
        expect(await asset.getNumberOfNonPerformingLoans()).to.equal(1);
      });

      it("GIVEN a loan with collateral WHEN notifying update THEN loan is categorized as secured", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;

        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const beforeUpdate = await asset.getSecuredLoansRatio();
        expect(beforeUpdate.denominator_).to.equal(1n);
        expect(beforeUpdate.numerator_).to.equal(0n); // Initially unsecured

        await loan.setLoanState(1000, 0);

        await expect(asset.notifyLoanHoldingsAssetUpdate(loanAddress))
          .to.emit(asset, "LoanHoldingsAssetUpdated")
          .withArgs(loanAddress);

        const afterUpdate = await asset.getSecuredLoansRatio();
        expect(afterUpdate.numerator_).to.equal(1n);
        expect(afterUpdate.denominator_).to.equal(1n);
      });

      it("GIVEN a zero address WHEN notifying update THEN reverts with ZeroAddressNotAllowed", async () => {
        await expect(asset.notifyLoanHoldingsAssetUpdate(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a paused portfolio WHEN notifying update THEN reverts with IsPaused", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;
        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });
        await asset.connect(signer_B).pause();

        await expect(asset.notifyLoanHoldingsAssetUpdate(loanAddress)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an unauthorized account WHEN notifying update THEN reverts with AccountHasNoRole", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await expect(asset.connect(signer_C).notifyLoanHoldingsAssetUpdate(loan.target))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.ROLE_LOANS_PORTFOLIO_MANAGER);
      });
    });

    describe("loansPortfolioWithdraw", () => {
      it("GIVEN a portfolio with loan balance WHEN withdrawing THEN tokens are transferred and event emitted", async () => {
        const portfolioAddress = asset.target;
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const mintAmount = 1000n;
        await loan.setBalance(DEFAULT_PARTITION, portfolioAddress, mintAmount);

        const withdrawAmount = 500n;
        await expect(asset.loansPortfolioWithdraw(loan.target, signer_A.address, withdrawAmount))
          .to.emit(asset, "LoansPortfolioWithdrawn")
          .withArgs(loan.target, signer_A.address, withdrawAmount);

        expect(await loan.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(withdrawAmount);
      });

      it("GIVEN zero amount WHEN withdrawing THEN reverts with ZeroValue", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        await expect(asset.loansPortfolioWithdraw(loan.target, signer_A.address, 0n)).to.be.revertedWithCustomError(
          asset,
          "ZeroValue",
        );
      });

      it("GIVEN portfolio paused WHEN withdrawing THEN reverts with IsPaused", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        await asset.connect(signer_B).pause();

        await expect(asset.loansPortfolioWithdraw(loan.target, signer_A.address, 0n)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN asset not in portfolio WHEN withdrawing THEN reverts with HoldingAssetNotFound", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;

        await expect(asset.loansPortfolioWithdraw(loanAddress, signer_A.address, 100n))
          .to.be.revertedWithCustomError(asset, "HoldingAssetNotFound")
          .withArgs(loanAddress);
      });

      it("GIVEN a zero asset address WHEN withdrawing THEN reverts with ZeroAddressNotAllowed", async () => {
        await expect(asset.loansPortfolioWithdraw(ADDRESS_ZERO, signer_A.address, 100n)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a zero recipient address WHEN withdrawing THEN reverts with ZeroAddressNotAllowed", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await expect(asset.loansPortfolioWithdraw(loan.target, ADDRESS_ZERO, 100n)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN asset in portfolio with no balance WHEN withdrawing THEN reverts", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        await expect(asset.loansPortfolioWithdraw(loan.target, signer_A.address, 100n)).to.be.revertedWithCustomError(
          loan,
          "InvalidPartition",
        );
      });

      it("GIVEN an unauthorized account WHEN withdrawing THEN reverts with AccountHasNoRole", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        await expect(asset.connect(signer_C).loansPortfolioWithdraw(loan.target, signer_A.address, 100n))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.ROLE_LOANS_PORTFOLIO_MANAGER);
      });
    });

    describe("getLoansPortfolioData", () => {
      it("GIVEN an initialized portfolio WHEN querying THEN returns correct portfolio data", async () => {
        const data = await asset.getLoansPortfolioData();

        expect(data.portfolioType).to.equal(1);
        expect(data.distributionPolicy).to.equal(1);
      });
    });

    describe("getHoldingsAssets", () => {
      it("GIVEN an empty portfolio WHEN querying THEN returns empty array", async () => {
        const result = await asset.getHoldingsAssets(0, 10);

        expect(result.length).to.equal(0);
      });

      it("GIVEN mixed assets WHEN querying THEN returns all addresses", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;
        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });
        await asset.addHoldingsAsset({
          assetAddress: signer_B.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        });

        const result = await asset.getHoldingsAssets(0, 10);

        expect(result.length).to.equal(2);
        expect(result).to.include(loanAddress);
        expect(result).to.include(signer_B.address);
      });

      it("GIVEN assets beyond page boundary WHEN querying THEN returns empty array", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const result = await asset.getHoldingsAssets(10, 10);

        expect(result.length).to.equal(0);
      });
    });

    describe("getLoanHoldingsAssets", () => {
      it("GIVEN an empty portfolio WHEN querying THEN returns empty array", async () => {
        const result = await asset.getLoanHoldingsAssets(0, 10);

        expect(result.length).to.equal(0);
      });

      it("GIVEN one LOAN asset WHEN querying THEN returns that asset", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;
        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const result = await asset.getLoanHoldingsAssets(0, 10);

        expect(result.length).to.equal(1);
        expect(result[0]).to.equal(loanAddress);
      });

      it("GIVEN CASH assets only WHEN querying loan assets THEN returns empty array", async () => {
        await asset.addHoldingsAsset({
          assetAddress: signer_B.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        });

        const result = await asset.getLoanHoldingsAssets(0, 10);

        expect(result.length).to.equal(0);
      });

      it("GIVEN multiple LOAN assets WHEN querying with pagination THEN returns correct pages", async () => {
        const loan1 = await new MockLoanHolding__factory(signer_A).deploy();
        await loan1.waitForDeployment();
        const loan1Address = loan1.target;
        const loan2 = await new MockLoanHolding__factory(signer_A).deploy();
        await loan2.waitForDeployment();
        const loan2Address = loan2.target;

        await asset.addHoldingsAsset({
          assetAddress: loan1Address,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });
        await asset.addHoldingsAsset({
          assetAddress: loan2Address,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const page0 = await asset.getLoanHoldingsAssets(0, 1);
        const page1 = await asset.getLoanHoldingsAssets(1, 1);
        const outOfBounds = await asset.getLoanHoldingsAssets(10, 10);

        expect(page0.length).to.equal(1);
        expect(page0[0]).to.equal(loan1Address);
        expect(page1.length).to.equal(1);
        expect(page1[0]).to.equal(loan2Address);
        expect(outOfBounds.length).to.equal(0);
      });
    });

    describe("getHoldingsAssetOwnership", () => {
      it("GIVEN an empty portfolio WHEN querying THEN returns empty arrays", async () => {
        const { assets_, balances_ } = await asset.getHoldingsAssetOwnership(0, 10);

        expect(assets_.length).to.equal(0);
        expect(balances_.length).to.equal(0);
      });

      it("GIVEN a loan with no minted balance WHEN querying THEN returns asset with zero balance", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { assets_, balances_ } = await asset.getHoldingsAssetOwnership(0, 10);

        expect(assets_.length).to.equal(1);
        expect(balances_[0]).to.equal(0n);
      });

      it("GIVEN a loan with minted balance WHEN querying THEN returns asset with correct balance", async () => {
        const portfolioAddress = await asset.getAddress();
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        const loanAddress = loan.target;

        const mintAmount = 1000n;
        await loan.setBalance(DEFAULT_PARTITION, portfolioAddress, mintAmount);

        await asset.addHoldingsAsset({
          assetAddress: loanAddress,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { assets_, balances_ } = await asset.getHoldingsAssetOwnership(0, 10);

        expect(assets_.length).to.equal(1);
        expect(assets_[0]).to.equal(loanAddress);
        expect(balances_[0]).to.equal(mintAmount);
      });
    });

    describe("getNumberOfAssets", () => {
      it("GIVEN empty portfolio WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberOfAssets()).to.equal(0n);
      });

      it("GIVEN one LOAN and one CASH WHEN querying THEN returns two", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });
        await asset.addHoldingsAsset({
          assetAddress: signer_B.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        });

        expect(await asset.getNumberOfAssets()).to.equal(2n);
      });
    });

    describe("getNumberOfLoans", () => {
      it("GIVEN empty portfolio WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberOfLoans()).to.equal(0n);
      });

      it("GIVEN one LOAN asset WHEN querying THEN returns one", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        expect(await asset.getNumberOfLoans()).to.equal(1n);
      });

      it("GIVEN only CASH assets WHEN querying THEN returns zero", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.CASH,
        });

        expect(await asset.getNumberOfLoans()).to.equal(0n);
      });
    });

    describe("getNumberOfCash", () => {
      it("GIVEN empty portfolio WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberOfCash()).to.equal(0n);
      });

      it("GIVEN one CASH asset WHEN querying THEN returns one", async () => {
        await asset.addHoldingsAsset({
          assetAddress: signer_B.address,
          holdingsAssetType: HoldingsAssetType.CASH,
        });

        expect(await asset.getNumberOfCash()).to.equal(1n);
      });

      it("GIVEN only LOAN assets WHEN querying THEN returns zero", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });
        expect(await asset.getNumberOfCash()).to.equal(0n);
      });
    });

    describe("getNumberOfPerformingLoans", () => {
      it("GIVEN no loans WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberOfPerformingLoans()).to.equal(0n);
      });

      it("GIVEN one PERFORMING loan WHEN querying THEN returns one", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        expect(await asset.getNumberOfPerformingLoans()).to.equal(1n);
      });
    });

    describe("getNumberOfNonPerformingLoans", () => {
      it("GIVEN no loans WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberOfNonPerformingLoans()).to.equal(0n);
      });

      it("GIVEN one NON_PERFORMING loan WHEN querying THEN returns one", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await loan.setLoanState(0, 1);

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        expect(await asset.getNumberOfNonPerformingLoans()).to.equal(1n);
      });
    });

    describe("getNumberDefaultedLoans", () => {
      it("GIVEN no loans WHEN querying THEN returns zero", async () => {
        expect(await asset.getNumberDefaultedLoans()).to.equal(0n);
      });

      it("GIVEN one DEFAULT loan WHEN querying THEN returns one", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await loan.setLoanState(0, 2);

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        expect(await asset.getNumberDefaultedLoans()).to.equal(1n);
      });
    });

    describe("getSecuredLoansRatio", () => {
      it("GIVEN no loans WHEN querying THEN returns (0, 0)", async () => {
        const { numerator_, denominator_ } = await asset.getSecuredLoansRatio();

        expect(numerator_).to.equal(0n);
        expect(denominator_).to.equal(0n);
      });

      it("GIVEN one unsecured loan WHEN querying THEN returns (0, 1)", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { numerator_, denominator_ } = await asset.getSecuredLoansRatio();

        expect(numerator_).to.equal(0n);
        expect(denominator_).to.equal(1n);
      });

      it("GIVEN one secured loan WHEN querying THEN returns (1, 1)", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await loan.setLoanState(100, 0);

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { numerator_, denominator_ } = await asset.getSecuredLoansRatio();

        expect(numerator_).to.equal(1n);
        expect(denominator_).to.equal(1n);
      });
    });

    describe("getPerformingLoansRatio", () => {
      it("GIVEN no loans WHEN querying THEN returns (0, 0)", async () => {
        const { numerator_, denominator_ } = await asset.getPerformingLoansRatio();

        expect(numerator_).to.equal(0n);
        expect(denominator_).to.equal(0n);
      });

      it("GIVEN one PERFORMING loan WHEN querying THEN returns (1, 1)", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { numerator_, denominator_ } = await asset.getPerformingLoansRatio();

        expect(numerator_).to.equal(1n);
        expect(denominator_).to.equal(1n);
      });
    });

    describe("getNonPerformingLoansRatio", () => {
      it("GIVEN no loans WHEN querying THEN returns (0, 0)", async () => {
        const { numerator_, denominator_ } = await asset.getNonPerformingLoansRatio();

        expect(numerator_).to.equal(0n);
        expect(denominator_).to.equal(0n);
      });

      it("GIVEN one NON_PERFORMING loan WHEN querying THEN returns (1, 1)", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await loan.setLoanState(0, 1);

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { numerator_, denominator_ } = await asset.getNonPerformingLoansRatio();

        expect(numerator_).to.equal(1n);
        expect(denominator_).to.equal(1n);
      });
    });

    describe("getDefaultedLoansRatio", () => {
      it("GIVEN no loans WHEN querying THEN returns (0, 0)", async () => {
        const { numerator_, denominator_ } = await asset.getDefaultedLoansRatio();

        expect(numerator_).to.equal(0n);
        expect(denominator_).to.equal(0n);
      });

      it("GIVEN one DEFAULT loan WHEN querying THEN returns (1, 1)", async () => {
        const loan = await new MockLoanHolding__factory(signer_A).deploy();
        await loan.waitForDeployment();
        await loan.setLoanState(0, 2);

        await asset.addHoldingsAsset({
          assetAddress: loan.target,
          holdingsAssetType: HoldingsAssetType.LOAN,
        });

        const { numerator_, denominator_ } = await asset.getDefaultedLoansRatio();

        expect(numerator_).to.equal(1n);
        expect(denominator_).to.equal(1n);
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN addHoldingsAsset THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.addHoldingsAsset({ assetAddress: ethers.ZeroAddress, holdingsAssetType: 0 }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN removeHoldingsAsset THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.removeHoldingsAsset({ assetAddress: ethers.ZeroAddress, holdingsAssetType: 0 }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN notifyLoanHoldingsAssetUpdate THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.notifyLoanHoldingsAssetUpdate(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN loansPortfolioWithdraw THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.loansPortfolioWithdraw(ethers.ZeroAddress, ethers.ZeroAddress, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN addHoldingsAsset THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.addHoldingsAsset({
            assetAddress: ADDRESS_ZERO,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN removeHoldingsAsset THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.removeHoldingsAsset({
            assetAddress: ADDRESS_ZERO,
            holdingsAssetType: HoldingsAssetType.LOAN,
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN notifyLoanHoldingsAssetUpdate THEN reverts with AssetNotOperational", async () => {
        await expect(asset.notifyLoanHoldingsAssetUpdate(ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN loansPortfolioWithdraw THEN reverts with AssetNotOperational", async () => {
        await expect(asset.loansPortfolioWithdraw(ADDRESS_ZERO, ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
