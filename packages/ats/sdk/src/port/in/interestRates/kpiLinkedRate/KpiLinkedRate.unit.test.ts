// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import KpiLinkedRate from "./KpiLinkedRate";
import { SetInterestRateCommand } from "@command/interestRates/setInterestRate/SetInterestRateCommand";
import { SetImpactDataCommand } from "@command/interestRates/setImpactData/SetImpactDataCommand";
import { GetInterestRateQuery } from "@query/interestRates/getInterestRate/GetInterestRateQuery";
import { GetImpactDataQuery } from "@query/interestRates/getImpactData/GetImpactDataQuery";
import SetInterestRateRequest from "../../request/interestRates/SetInterestRateRequest";
import SetImpactDataRequest from "../../request/interestRates/SetImpactDataRequest";
import GetInterestRateRequest from "../../request/interestRates/GetInterestRateRequest";
import GetImpactDataRequest from "../../request/kpiLinkedRate/GetImpactDataRequest";

describe("KpiLinkedRate", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let setInterestRateRequest: SetInterestRateRequest;
  let setImpactDataRequest: SetImpactDataRequest;
  let getInterestRateRequest: GetInterestRateRequest;
  let getImpactDataRequest: GetImpactDataRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  const expectedSetInterestRateResponse = {
    payload: true,
    transactionId: transactionId,
  };

  const expectedSetImpactDataResponse = {
    payload: true,
    transactionId: transactionId,
  };

  const expectedGetInterestRateResponse = {
    maxRate: "10.5",
    baseRate: "5.5",
    minRate: "1.5",
    startPeriod: "1640995200",
    startRate: "4.5",
    missedPenalty: "2.5",
    reportPeriod: "30",
    rateDecimals: 8,
  };

  const expectedGetImpactDataResponse = {
    maxDeviationCap: "100.5",
    baseLine: "50.0",
    maxDeviationFloor: "10.5",
    impactDataDecimals: 8,
    adjustmentPrecision: "5.0",
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (KpiLinkedRate as any).commandBus = commandBusMock;
    (KpiLinkedRate as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setInterestRate", () => {
    beforeEach(() => {
      setInterestRateRequest = new SetInterestRateRequest({
        securityId: "0x1234567890123456789012345678901234567890",
        maxRate: "10.5",
        baseRate: "5.5",
        minRate: "1.5",
        startPeriod: "1640995200",
        startRate: "4.5",
        missedPenalty: "2.5",
        reportPeriod: "30",
        rateDecimals: 8,
      });
    });

    it("should set interest rate successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedSetInterestRateResponse);

      const result = await KpiLinkedRate.setInterestRate(setInterestRateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetInterestRateRequest", setInterestRateRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetInterestRateCommand(
          setInterestRateRequest.securityId,
          setInterestRateRequest.maxRate,
          setInterestRateRequest.baseRate,
          setInterestRateRequest.minRate,
          setInterestRateRequest.startPeriod,
          setInterestRateRequest.startRate,
          setInterestRateRequest.missedPenalty,
          setInterestRateRequest.reportPeriod,
          setInterestRateRequest.rateDecimals,
        ),
      );

      expect(result).toEqual(expectedSetInterestRateResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.setInterestRate(setInterestRateRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetInterestRateRequest", setInterestRateRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetInterestRateCommand(
          setInterestRateRequest.securityId,
          setInterestRateRequest.maxRate,
          setInterestRateRequest.baseRate,
          setInterestRateRequest.minRate,
          setInterestRateRequest.startPeriod,
          setInterestRateRequest.startRate,
          setInterestRateRequest.missedPenalty,
          setInterestRateRequest.reportPeriod,
          setInterestRateRequest.rateDecimals,
        ),
      );
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(KpiLinkedRate.setInterestRate(setInterestRateRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetInterestRateRequest", setInterestRateRequest);

      expect(commandBusMock.execute).not.toHaveBeenCalled();
    });
  });

  describe("setImpactData", () => {
    beforeEach(() => {
      setImpactDataRequest = new SetImpactDataRequest({
        securityId: "0x1234567890123456789012345678901234567890",
        maxDeviationCap: "100.5",
        baseLine: "50.0",
        maxDeviationFloor: "10.5",
        impactDataDecimals: 8,
        adjustmentPrecision: "5.0",
      });
    });

    it("should set impact data successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedSetImpactDataResponse);

      const result = await KpiLinkedRate.setImpactData(setImpactDataRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetImpactDataRequest", setImpactDataRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetImpactDataCommand(
          setImpactDataRequest.securityId,
          setImpactDataRequest.maxDeviationCap,
          setImpactDataRequest.baseLine,
          setImpactDataRequest.maxDeviationFloor,
          setImpactDataRequest.impactDataDecimals,
          setImpactDataRequest.adjustmentPrecision,
        ),
      );

      expect(result).toEqual(expectedSetImpactDataResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.setImpactData(setImpactDataRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetImpactDataRequest", setImpactDataRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetImpactDataCommand(
          setImpactDataRequest.securityId,
          setImpactDataRequest.maxDeviationCap,
          setImpactDataRequest.baseLine,
          setImpactDataRequest.maxDeviationFloor,
          setImpactDataRequest.impactDataDecimals,
          setImpactDataRequest.adjustmentPrecision,
        ),
      );
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(KpiLinkedRate.setImpactData(setImpactDataRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetImpactDataRequest", setImpactDataRequest);

      expect(commandBusMock.execute).not.toHaveBeenCalled();
    });
  });

  describe("getInterestRate", () => {
    beforeEach(() => {
      getInterestRateRequest = new GetInterestRateRequest({
        securityId: "0x1234567890123456789012345678901234567890",
      });
    });

    it("should get interest rate successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedGetInterestRateResponse);

      const result = await KpiLinkedRate.getInterestRate(getInterestRateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetInterestRateRequest", getInterestRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetInterestRateQuery(getInterestRateRequest.securityId));

      expect(result).toEqual(expectedGetInterestRateResponse);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.getInterestRate(getInterestRateRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetInterestRateRequest", getInterestRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetInterestRateQuery(getInterestRateRequest.securityId));
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(KpiLinkedRate.getInterestRate(getInterestRateRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetInterestRateRequest", getInterestRateRequest);

      expect(queryBusMock.execute).not.toHaveBeenCalled();
    });
  });

  describe("getImpactData", () => {
    beforeEach(() => {
      getImpactDataRequest = new GetImpactDataRequest({
        securityId: "0x1234567890123456789012345678901234567890",
      });
    });

    it("should get impact data successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedGetImpactDataResponse);

      const result = await KpiLinkedRate.getImpactData(getImpactDataRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetImpactDataRequest", getImpactDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetImpactDataQuery(getImpactDataRequest.securityId));

      expect(result).toEqual(expectedGetImpactDataResponse);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(KpiLinkedRate.getImpactData(getImpactDataRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetImpactDataRequest", getImpactDataRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetImpactDataQuery(getImpactDataRequest.securityId));
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(KpiLinkedRate.getImpactData(getImpactDataRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetImpactDataRequest", getImpactDataRequest);

      expect(queryBusMock.execute).not.toHaveBeenCalled();
    });
  });
});
