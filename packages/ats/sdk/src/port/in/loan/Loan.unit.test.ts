// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { CreateLoanRequest, GetLoanDetailsRequest, SetLoanDetailsRequest } from "../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import NetworkService from "@service/network/NetworkService";
import LoanToken from "./Loan";
import {
  LoanDetailsFixture,
  GetLoanDetailsRequestFixture,
  SetLoanDetailsCommandFixture,
} from "@test/fixtures/loan/LoanFixture";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { CreateLoanCommand } from "@command/loan/create/CreateLoanCommand";
import ContractId from "@domain/context/contract/ContractId";
import { GetLoanDetailsQuery } from "@query/loan/get/getLoanDetails/GetLoanDetailsQuery";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { SetLoanDetailsCommand } from "@command/loan/setDetails/SetLoanDetailsCommand";

describe("Loan", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let createLoanRequest: CreateLoanRequest;
  let getLoanDetailsRequest: GetLoanDetailsRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const security = new Security(SecurityPropsFixture.create());
  const factoryAddress = HederaIdPropsFixture.create().value;
  const resolverAddress = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation").mockImplementation(() => {});
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: factoryAddress,
        resolverAddress: resolverAddress,
      },
    });
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (LoanToken as any).commandBus = commandBusMock;
    (LoanToken as any).queryBus = queryBusMock;
    (LoanToken as any).networkService = networkServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    const currentTime = Math.floor(Date.now() / 1000) + 1000;
    createLoanRequest = new CreateLoanRequest({
      security: {
        name: "Test Loan",
        symbol: "TLN",
        isin: "US123456789",
        decimals: 0,
        isWhiteList: false,
        erc20VotesActivated: false,
        isControllable: true,
        arePartitionsProtected: false,
        isMultiPartition: false,
        clearingActive: false,
        internalKycActivated: true,
        numberOfUnits: "1000",
        regulationType: 1,
        regulationSubType: 0,
        isCountryControlListWhiteList: true,
        countries: "US",
        info: "test",
        configId: "0x0000000000000000000000000000000000000000000000000000000000000006",
        configVersion: 1,
        diamondOwnerAccount: factoryAddress,
      },
      nominalValue: "100",
      nominalValueDecimals: 2,
      loanBasicData: {
        currency: "0x555344",
        startingDate: (currentTime + 30).toString(),
        maturityDate: (currentTime + 100_000).toString(),
        loanStructureType: 1,
        repaymentType: 0,
        interestType: 0,
        signingDate: currentTime.toString(),
        originatorAccount: factoryAddress,
        servicerAccount: resolverAddress,
      },
    });

    it("should create successfully", async () => {
      const expectedResponse = {
        securityId: new ContractId(HederaIdPropsFixture.create().value),
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);
      queryBusMock.execute.mockResolvedValue({
        security: security,
      });

      const result = await LoanToken.create(createLoanRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateLoanRequest", createLoanRequest);
      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(result).toEqual(
        expect.objectContaining({
          security: security,
          transactionId: expectedResponse.transactionId,
        }),
      );
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(LoanToken.create(createLoanRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateLoanRequest", createLoanRequest);
    });
  });

  describe("getLoanDetails", () => {
    getLoanDetailsRequest = new GetLoanDetailsRequest(GetLoanDetailsRequestFixture.create());

    it("should return loan details", async () => {
      const loanDetails = LoanDetailsFixture.create();

      queryBusMock.execute.mockResolvedValue({
        loan: loanDetails,
      });

      const result = await LoanToken.getLoanDetails(getLoanDetailsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLoanDetailsRequest", getLoanDetailsRequest);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(result.currency).toEqual(loanDetails.currency);
      expect(result.startingDate).toEqual(new Date(loanDetails.startingDate * ONE_THOUSAND));
      expect(result.maturityDate).toEqual(new Date(loanDetails.maturityDate * ONE_THOUSAND));
      expect(result.loanStructureType).toEqual(loanDetails.loanStructureType);
      expect(result.repaymentType).toEqual(loanDetails.repaymentType);
      expect(result.interestType).toEqual(loanDetails.interestType);
      expect(result.signingDate).toEqual(new Date(loanDetails.signingDate * ONE_THOUSAND));
      expect(result.originatorAccount).toEqual(loanDetails.originatorAccount);
      expect(result.servicerAccount).toEqual(loanDetails.servicerAccount);
      expect(result.baseReferenceRate).toEqual(loanDetails.baseReferenceRate);
      expect(result.floorRate).toEqual(loanDetails.floorRate.toString());
      expect(result.capRate).toEqual(loanDetails.capRate.toString());
      expect(result.rateMargin).toEqual(loanDetails.rateMargin.toString());
      expect(result.dayCount).toEqual(loanDetails.dayCount);
      expect(result.paymentFrequency).toEqual(loanDetails.paymentFrequency);
      expect(result.firstAccrualDate).toEqual(new Date(loanDetails.firstAccrualDate * ONE_THOUSAND));
      expect(result.prepaymentPenalty).toEqual(loanDetails.prepaymentPenalty.toString());
      expect(result.commitmentFee).toEqual(loanDetails.commitmentFee.toString());
      expect(result.utilizationFee).toEqual(loanDetails.utilizationFee.toString());
      expect(result.utilizationFeeType).toEqual(loanDetails.utilizationFeeType);
      expect(result.servicingFee).toEqual(loanDetails.servicingFee.toString());
      expect(result.internalRiskGrade).toEqual(loanDetails.internalRiskGrade);
      expect(result.defaultProbability).toEqual(loanDetails.defaultProbability.toString());
      expect(result.lossGivenDefault).toEqual(loanDetails.lossGivenDefault.toString());
      expect(result.totalCollateralValue).toEqual(loanDetails.totalCollateralValue.toString());
      expect(result.loanToValue).toEqual(loanDetails.loanToValue.toString());
      expect(result.performanceStatus).toEqual(loanDetails.performanceStatus);
      expect(result.daysPastDue).toEqual(loanDetails.daysPastDue.toString());
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(LoanToken.getLoanDetails(getLoanDetailsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetLoanDetailsRequest", getLoanDetailsRequest);
    });
  });

  describe("setLoanDetails", () => {
    it("should set loan details successfully", async () => {
      const setCommand = SetLoanDetailsCommandFixture.create();
      const setRequest = new SetLoanDetailsRequest({
        loanId: setCommand.loanId,
        loanBasicData: {
          currency: setCommand.currency,
          startingDate: setCommand.startingDate,
          maturityDate: setCommand.maturityDate,
          loanStructureType: setCommand.loanStructureType,
          repaymentType: setCommand.repaymentType,
          interestType: setCommand.interestType,
          signingDate: setCommand.signingDate,
          originatorAccount: setCommand.originatorAccount,
          servicerAccount: setCommand.servicerAccount,
        },
        loanInterestData: {
          baseReferenceRate: setCommand.baseReferenceRate,
          floorRate: setCommand.floorRate,
          capRate: setCommand.capRate,
          rateMargin: setCommand.rateMargin,
          dayCount: setCommand.dayCount,
          paymentFrequency: setCommand.paymentFrequency,
          firstAccrualDate: setCommand.firstAccrualDate,
          prepaymentPenalty: setCommand.prepaymentPenalty,
          commitmentFee: setCommand.commitmentFee,
          utilizationFee: setCommand.utilizationFee,
          utilizationFeeType: setCommand.utilizationFeeType,
          servicingFee: setCommand.servicingFee,
        },
        riskData: {
          internalRiskGrade: setCommand.internalRiskGrade,
          defaultProbability: setCommand.defaultProbability,
          lossGivenDefault: setCommand.lossGivenDefault,
        },
        collateral: {
          totalCollateralValue: setCommand.totalCollateralValue,
          loanToValue: setCommand.loanToValue,
        },
        loanPerformanceStatus: {
          performanceStatus: setCommand.performanceStatus,
          daysPastDue: setCommand.daysPastDue,
        },
      });

      const expectedResponse = { transactionId: transactionId };
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await LoanToken.setLoanDetails(setRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetLoanDetailsRequest", setRequest);
      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ transactionId: transactionId });
    });

    it("should throw an error if command execution fails", async () => {
      const setCommand = SetLoanDetailsCommandFixture.create();
      const setRequest = new SetLoanDetailsRequest({
        loanId: setCommand.loanId,
        loanBasicData: {
          currency: setCommand.currency,
          startingDate: setCommand.startingDate,
          maturityDate: setCommand.maturityDate,
          loanStructureType: setCommand.loanStructureType,
          repaymentType: setCommand.repaymentType,
          interestType: setCommand.interestType,
          signingDate: setCommand.signingDate,
          originatorAccount: setCommand.originatorAccount,
          servicerAccount: setCommand.servicerAccount,
        },
        loanInterestData: {
          baseReferenceRate: setCommand.baseReferenceRate,
          floorRate: setCommand.floorRate,
          capRate: setCommand.capRate,
          rateMargin: setCommand.rateMargin,
          dayCount: setCommand.dayCount,
          paymentFrequency: setCommand.paymentFrequency,
          firstAccrualDate: setCommand.firstAccrualDate,
          prepaymentPenalty: setCommand.prepaymentPenalty,
          commitmentFee: setCommand.commitmentFee,
          utilizationFee: setCommand.utilizationFee,
          utilizationFeeType: setCommand.utilizationFeeType,
          servicingFee: setCommand.servicingFee,
        },
        riskData: {
          internalRiskGrade: setCommand.internalRiskGrade,
          defaultProbability: setCommand.defaultProbability,
          lossGivenDefault: setCommand.lossGivenDefault,
        },
        collateral: {
          totalCollateralValue: setCommand.totalCollateralValue,
          loanToValue: setCommand.loanToValue,
        },
        loanPerformanceStatus: {
          performanceStatus: setCommand.performanceStatus,
          daysPastDue: setCommand.daysPastDue,
        },
      });

      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(LoanToken.setLoanDetails(setRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetLoanDetailsRequest", setRequest);
    });
  });
});
