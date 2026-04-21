// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset } from "@contract-types";
import {
  executeRbac,
  deployLoanTokenFixture,
  getRegulationData,
  MAX_UINT256,
  deployLoansPortfolioTokenFixture,
  DEFAULT_LOANS_PORTFOLIO_PARAMS,
  getLoanDetails,
} from "@test";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ADDRESS_ZERO, ATS_ROLES, buildRegulationData, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";
import { ethers } from "hardhat";
import { HoldingsAssetType } from "@scripts/domain";

describe("LoansPortfolio Token Tests", () => {
  let asset: IAsset;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let loanAsset: IAsset;

  async function deployLoansPortfolioFixture() {
    const base = await deployLoansPortfolioTokenFixture();
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", base.tokenAddress, signer_A);

    await executeRbac(asset, [
      { role: ATS_ROLES._LOANS_PORTFOLIO_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
    ]);

    loanAsset = await deployLoanToken();
  }

  async function deployLoanToken(params: { performanceStatus?: number; totalCollateralValue?: number } = {}) {
    const loanBase = await deployLoanTokenFixture({
      loanParams: {
        loanInit: {
          originatorAccount: signer_A?.address,
          servicerAccount: signer_B?.address,
          performanceStatus: params.performanceStatus ?? 0,
          totalCollateralValue: params.totalCollateralValue ?? 0,
        },
      },
      useLoadFixture: false,
    });

    const loanIAsset = await ethers.getContractAt("IAsset", loanBase.tokenAddress, signer_A);

    await executeRbac(loanIAsset, [
      { role: ATS_ROLES._ISSUER_ROLE, members: [signer_A?.address] },
      { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A?.address] },
      { role: ATS_ROLES._KYC_ROLE, members: [signer_B?.address] },
      { role: ATS_ROLES._LOAN_MANAGER_ROLE, members: [signer_A.address] },
    ]);

    await loanIAsset.addIssuer(signer_A.address);
    await loanIAsset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

    return loanIAsset;
  }

  beforeEach(async () => {
    await loadFixture(deployLoansPortfolioFixture);
  });

  describe("_initialize_LoansPortfolio", () => {
    it("GIVEN a deployed portfolio WHEN initializing THEN state is set correctly", async () => {
      const data = await asset.getLoansPortfolioData();

      expect(data.portfolioType).to.equal(DEFAULT_LOANS_PORTFOLIO_PARAMS.portfolioType);
      expect(data.distributionPolicy).to.equal(DEFAULT_LOANS_PORTFOLIO_PARAMS.distributionPolicy);
    });

    it("GIVEN an already initialized portfolio WHEN initializing again THEN reverts with AlreadyInitialized", async () => {
      const regulationData = getRegulationData();

      await expect(
        asset.initializeLoansPortfolio(
          {
            portfolioType: DEFAULT_LOANS_PORTFOLIO_PARAMS.portfolioType,
            distributionPolicy: DEFAULT_LOANS_PORTFOLIO_PARAMS.distributionPolicy,
          },
          buildRegulationData(regulationData.regulationType, regulationData.regulationSubType),
          {
            countriesControlListType: regulationData.additionalSecurityData.countriesControlListType,
            listOfCountries: regulationData.additionalSecurityData.listOfCountries,
            info: regulationData.additionalSecurityData.info,
          },
        ),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });
  });

  describe("addHoldingsAsset", () => {
    it("GIVEN a valid LOAN asset WHEN adding THEN asset is added and event emitted", async () => {
      const holdingsAsset = {
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
        country: "",
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
          country: "",
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
          country: "ES",
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a paused portfolio WHEN adding asset THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();

      await expect(
        asset.addHoldingsAsset({
          assetAddress: await loanAsset.getAddress(),
          holdingsAssetType: HoldingsAssetType.LOAN,
          country: "ES",
        }),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an unauthorized account WHEN adding asset THEN reverts with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_C).addHoldingsAsset({
          assetAddress: await loanAsset.getAddress(),
          holdingsAssetType: HoldingsAssetType.LOAN,
          country: "ES",
        }),
      )
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES._LOANS_PORTFOLIO_MANAGER_ROLE);
    });

    it("GIVEN an existing asset WHEN adding the same asset THEN reverts with HoldingsAssetAlreadyExists", async () => {
      const holdingsAsset = {
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      };
      await asset.addHoldingsAsset(holdingsAsset);

      await expect(asset.addHoldingsAsset(holdingsAsset))
        .to.be.revertedWithCustomError(asset, "HoldingsAssetAlreadyExists")
        .withArgs(await loanAsset.getAddress());
    });
  });

  describe("removeHoldingsAsset", () => {
    it("GIVEN an existing LOAN asset WHEN removing THEN asset is removed and event emitted", async () => {
      const holdingsAsset = {
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
        country: "",
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
          country: "",
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
          country: "ES",
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
          country: "",
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
          country: "ES",
        }),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a paused portfolio WHEN removing LOAN asset THEN reverts with TokenIsPaused", async () => {
      const holdingsAsset = {
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      };
      await asset.addHoldingsAsset(holdingsAsset);
      await asset.connect(signer_B).pause();

      await expect(asset.removeHoldingsAsset(holdingsAsset)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an unauthorized account WHEN removing LOAN asset THEN reverts with AccountHasNoRole", async () => {
      const holdingsAsset = {
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      };
      await asset.addHoldingsAsset(holdingsAsset);

      await expect(asset.connect(signer_C).removeHoldingsAsset(holdingsAsset))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES._LOANS_PORTFOLIO_MANAGER_ROLE);
    });
  });

  describe("notifyLoanHoldingsAssetUpdate", () => {
    it("GIVEN an added LOAN asset WHEN notifying update THEN event is emitted and categorization is refreshed", async () => {
      const loanAddress = await loanAsset.getAddress();

      // 1. Añadir loan (ya clasifica como PERFORMING)
      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      expect(await asset.getNumberOfPerformingLoans()).to.equal(1);
      const details = await getLoanDetails();
      details.loanPerformanceStatus.performanceStatus = 1;
      // 2. Change loan status to NON_PERFORMING using helper
      await loanAsset.setLoanDetails(details);

      expect((await loanAsset.getLoanDetails()).loanPerformanceStatus.performanceStatus).to.equal(1);

      expect(await asset.getNumberOfPerformingLoans()).to.equal(1);
      expect(await asset.getNumberOfNonPerformingLoans()).to.equal(0);

      await expect(asset.notifyLoanHoldingsAssetUpdate(loanAddress))
        .to.emit(asset, "LoanHoldingsAssetUpdated")
        .withArgs(loanAddress);

      expect(await asset.getNumberOfPerformingLoans()).to.equal(0);
      expect(await asset.getNumberOfNonPerformingLoans()).to.equal(1);
    });

    it("GIVEN a loan with collateral WHEN notifying update THEN loan is categorized as secured", async () => {
      const loan = await deployLoanToken({ totalCollateralValue: 0 });
      const loanAddress = await loan.getAddress();

      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const beforeUpdate = await asset.getSecuredLoansRatio();
      expect(beforeUpdate.denominator_).to.equal(1n);
      expect(beforeUpdate.numerator_).to.equal(0n); // Initially unsecured

      const details = await getLoanDetails();
      details.collateral.totalCollateralValue = 1000;

      await loan.setLoanDetails(details);

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

    it("GIVEN a paused portfolio WHEN notifying update THEN reverts with TokenIsPaused", async () => {
      const loanAddress = await loanAsset.getAddress();
      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.connect(signer_B).pause();

      await expect(asset.notifyLoanHoldingsAssetUpdate(loanAddress)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN an unauthorized account WHEN notifying update THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).notifyLoanHoldingsAssetUpdate(await loanAsset.getAddress()))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES._LOANS_PORTFOLIO_MANAGER_ROLE);
    });
  });

  describe("loansPortfolioWithdraw", () => {
    it("GIVEN a portfolio with loan balance WHEN withdrawing THEN tokens are transferred and event emitted", async () => {
      const portfolioAddress = await asset.getAddress();
      const loanAddress = await loanAsset.getAddress();

      await loanAsset.connect(signer_B).grantKyc(portfolioAddress, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const mintAmount = 1000n;
      await loanAsset.connect(signer_A).issueByPartition({
        data: "0x",
        tokenHolder: portfolioAddress,
        value: mintAmount,
        partition: DEFAULT_PARTITION,
      });

      const withdrawAmount = 500n;
      await expect(asset.loansPortfolioWithdraw(loanAddress, signer_A.address, withdrawAmount))
        .to.emit(asset, "LoansPortfolioWithdrawn")
        .withArgs(loanAddress, signer_A.address, withdrawAmount);

      expect(await loanAsset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address)).to.equal(withdrawAmount);
    });

    it("GIVEN zero amount WHEN withdrawing THEN reverts with ZeroValue", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      await expect(
        asset.loansPortfolioWithdraw(await loanAsset.getAddress(), signer_A.address, 0n),
      ).to.be.revertedWithCustomError(asset, "ZeroValue");
    });

    it("GIVEN portfolio paused WHEN withdrawing THEN reverts with TokenIsPaused", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      await asset.connect(signer_B).pause();

      await expect(
        asset.loansPortfolioWithdraw(await loanAsset.getAddress(), signer_A.address, 0n),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN asset not in portfolio WHEN withdrawing THEN reverts with HoldingAssetNotFound", async () => {
      const loanAddress = await loanAsset.getAddress();

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
      await expect(
        asset.loansPortfolioWithdraw(await loanAsset.getAddress(), ADDRESS_ZERO, 100n),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN asset in portfolio with no balance WHEN withdrawing THEN reverts", async () => {
      const portfolioAddress = await asset.getAddress();
      const loanAddress = await loanAsset.getAddress();

      await loanAsset.connect(signer_B).grantKyc(portfolioAddress, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      await expect(asset.loansPortfolioWithdraw(loanAddress, signer_A.address, 100n)).to.be.revertedWithCustomError(
        loanAsset,
        "InvalidPartition",
      );
    });

    it("GIVEN an unauthorized account WHEN withdrawing THEN reverts with AccountHasNoRole", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      await expect(asset.connect(signer_C).loansPortfolioWithdraw(await loanAsset.getAddress(), signer_A.address, 100n))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES._LOANS_PORTFOLIO_MANAGER_ROLE);
    });
  });

  describe("getLoansPortfolioData", () => {
    it("GIVEN an initialized portfolio WHEN querying THEN returns correct portfolio data", async () => {
      const data = await asset.getLoansPortfolioData();

      expect(data.portfolioType).to.equal(DEFAULT_LOANS_PORTFOLIO_PARAMS.portfolioType);
      expect(data.distributionPolicy).to.equal(DEFAULT_LOANS_PORTFOLIO_PARAMS.distributionPolicy);
    });
  });

  describe("getHoldingsAssets", () => {
    it("GIVEN an empty portfolio WHEN querying THEN returns empty array", async () => {
      const result = await asset.getHoldingsAssets(0, 10);

      expect(result.length).to.equal(0);
    });

    it("GIVEN mixed assets WHEN querying THEN returns all addresses", async () => {
      const loanAddress = await loanAsset.getAddress();
      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.addHoldingsAsset({
        assetAddress: signer_B.address,
        holdingsAssetType: HoldingsAssetType.CASH,
        country: "",
      });

      const result = await asset.getHoldingsAssets(0, 10);

      expect(result.length).to.equal(2);
      expect(result).to.include(loanAddress);
      expect(result).to.include(signer_B.address);
    });

    it("GIVEN assets beyond page boundary WHEN querying THEN returns empty array", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
      const loanAddress = await loanAsset.getAddress();
      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const result = await asset.getLoanHoldingsAssets(0, 10);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(loanAddress);
    });

    it("GIVEN CASH assets only WHEN querying loan assets THEN returns empty array", async () => {
      await asset.addHoldingsAsset({
        assetAddress: signer_B.address,
        holdingsAssetType: HoldingsAssetType.CASH,
        country: "",
      });

      const result = await asset.getLoanHoldingsAssets(0, 10);

      expect(result.length).to.equal(0);
    });

    it("GIVEN multiple LOAN assets WHEN querying with pagination THEN returns correct pages", async () => {
      const loan2 = await deployLoanToken({ performanceStatus: 0 });
      const loanAddress = await loanAsset.getAddress();
      const loan2Address = await loan2.getAddress();

      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.addHoldingsAsset({
        assetAddress: loan2Address,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "US",
      });

      const page0 = await asset.getLoanHoldingsAssets(0, 1);
      const page1 = await asset.getLoanHoldingsAssets(1, 1);
      const outOfBounds = await asset.getLoanHoldingsAssets(10, 10);

      expect(page0.length).to.equal(1);
      expect(page0[0]).to.equal(loanAddress);
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
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const { assets_, balances_ } = await asset.getHoldingsAssetOwnership(0, 10);

      expect(assets_.length).to.equal(1);
      expect(balances_[0]).to.equal(0n);
    });

    it("GIVEN a loan with minted balance WHEN querying THEN returns asset with correct balance", async () => {
      const portfolioAddress = await asset.getAddress();
      const loanAddress = await loanAsset.getAddress();

      await loanAsset.connect(signer_B).grantKyc(portfolioAddress, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

      await asset.addHoldingsAsset({
        assetAddress: loanAddress,
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const mintAmount = 1000n;
      await loanAsset.connect(signer_A).issueByPartition({
        data: "0x",
        tokenHolder: portfolioAddress,
        value: mintAmount,
        partition: DEFAULT_PARTITION,
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
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.addHoldingsAsset({
        assetAddress: signer_B.address,
        holdingsAssetType: HoldingsAssetType.CASH,
        country: "",
      });

      expect(await asset.getNumberOfAssets()).to.equal(2n);
    });
  });

  describe("getNumberOfLoans", () => {
    it("GIVEN empty portfolio WHEN querying THEN returns zero", async () => {
      expect(await asset.getNumberOfLoans()).to.equal(0n);
    });

    it("GIVEN one LOAN asset WHEN querying THEN returns one", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      expect(await asset.getNumberOfLoans()).to.equal(1n);
    });

    it("GIVEN only CASH assets WHEN querying THEN returns zero", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.CASH,
        country: "",
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
        country: "",
      });

      expect(await asset.getNumberOfCash()).to.equal(1n);
    });

    it("GIVEN only LOAN assets WHEN querying THEN returns zero", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      expect(await asset.getNumberOfCash()).to.equal(0n);
    });
  });

  describe("getNumberOfPerformingLoans", () => {
    it("GIVEN no loans WHEN querying THEN returns zero", async () => {
      expect(await asset.getNumberOfPerformingLoans()).to.equal(0n);
    });

    it("GIVEN one PERFORMING loan WHEN querying THEN returns one", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      expect(await asset.getNumberOfPerformingLoans()).to.equal(1n);
    });
  });

  describe("getNumberOfNonPerformingLoans", () => {
    it("GIVEN no loans WHEN querying THEN returns zero", async () => {
      expect(await asset.getNumberOfNonPerformingLoans()).to.equal(0n);
    });

    it("GIVEN one NON_PERFORMING loan WHEN querying THEN returns one", async () => {
      const nonPerformingLoan = await deployLoanToken({ performanceStatus: 1 });

      await asset.addHoldingsAsset({
        assetAddress: await nonPerformingLoan.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      expect(await asset.getNumberOfNonPerformingLoans()).to.equal(1n);
    });
  });

  describe("getNumberDefaultedLoans", () => {
    it("GIVEN no loans WHEN querying THEN returns zero", async () => {
      expect(await asset.getNumberDefaultedLoans()).to.equal(0n);
    });

    it("GIVEN one DEFAULT loan WHEN querying THEN returns one", async () => {
      const defaultedLoan = await deployLoanToken({ performanceStatus: 2 });

      await asset.addHoldingsAsset({
        assetAddress: await defaultedLoan.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const { numerator_, denominator_ } = await asset.getSecuredLoansRatio();

      expect(numerator_).to.equal(0n);
      expect(denominator_).to.equal(1n);
    });

    it("GIVEN one secured loan WHEN querying THEN returns (1, 1)", async () => {
      const securedLoan = await deployLoanToken({ totalCollateralValue: 100 });

      await asset.addHoldingsAsset({
        assetAddress: await securedLoan.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
      const nonPerformingLoan = await deployLoanToken({ performanceStatus: 1 });

      await asset.addHoldingsAsset({
        assetAddress: await nonPerformingLoan.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
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
      const defaultedLoan = await deployLoanToken({ performanceStatus: 2 });

      await asset.addHoldingsAsset({
        assetAddress: await defaultedLoan.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const { numerator_, denominator_ } = await asset.getDefaultedLoansRatio();

      expect(numerator_).to.equal(1n);
      expect(denominator_).to.equal(1n);
    });
  });

  describe("getGeographicalExposure", () => {
    it("GIVEN no loans WHEN querying THEN returns empty array", async () => {
      const result = await asset.getGeographicalExposure();

      expect(result.length).to.equal(0);
    });

    it.skip("GIVEN one loan in country ES WHEN querying THEN returns one entry with count 1", async () => {
      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const result = await asset.getGeographicalExposure();

      expect(result.length).to.equal(1);
      expect(result[0].country).to.equal("ES");
      expect(result[0].count).to.equal(1n);
    });

    it.skip("GIVEN two loans in different countries WHEN querying THEN returns two entries with count 1 each", async () => {
      const loan2 = await deployLoanToken({ performanceStatus: 0 });

      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.addHoldingsAsset({
        assetAddress: await loan2.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "US",
      });

      const result = await asset.getGeographicalExposure();

      expect(result.length).to.equal(2);
      const countryMap = Object.fromEntries(
        result.map((e: { country: string; count: bigint }) => [e.country, e.count]),
      );
      expect(countryMap["ES"]).to.equal(1n);
      expect(countryMap["US"]).to.equal(1n);
    });

    it.skip("GIVEN two loans in the same country WHEN querying THEN returns one entry with count 2", async () => {
      const loan2 = await deployLoanToken({ performanceStatus: 0 });

      await asset.addHoldingsAsset({
        assetAddress: await loanAsset.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });
      await asset.addHoldingsAsset({
        assetAddress: await loan2.getAddress(),
        holdingsAssetType: HoldingsAssetType.LOAN,
        country: "ES",
      });

      const result = await asset.getGeographicalExposure();

      expect(result.length).to.equal(1);
      expect(result[0].country).to.equal("ES");
      expect(result[0].count).to.equal(2n);
    });

    it("GIVEN CASH assets only WHEN querying THEN returns empty array", async () => {
      await asset.addHoldingsAsset({
        assetAddress: signer_B.address,
        holdingsAssetType: HoldingsAssetType.CASH,
        country: "",
      });

      const result = await asset.getGeographicalExposure();

      expect(result.length).to.equal(0);
    });
  });
});
