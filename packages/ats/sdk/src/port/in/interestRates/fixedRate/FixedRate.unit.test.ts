// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import FixedRate from "./FixedRate";
import { SetRateCommand } from "@command/interestRates/setRate/SetRateCommand";
import { GetRateQuery } from "@query/interestRates/getRate/GetRateQuery";
import SetRateRequest from "../../request/interestRates/SetRateRequest";
import GetRateRequest from "../../request/interestRates/GetRateRequest";

describe("FixedRate", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let setRateRequest: SetRateRequest;
  let getRateRequest: GetRateRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  const expectedSetRateResponse = {
    payload: true,
    transactionId: transactionId,
  };

  const expectedGetRateResponse = {
    rate: "5.5",
    decimals: 8,
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (FixedRate as any).commandBus = commandBusMock;
    (FixedRate as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setRate", () => {
    beforeEach(() => {
      setRateRequest = new SetRateRequest({
        securityId: "0x1234567890123456789012345678901234567890",
        rate: "5.5",
        rateDecimals: 8,
      });
    });

    it("should set rate successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedSetRateResponse);

      const result = await FixedRate.setRate(setRateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetRateRequest", setRateRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetRateCommand(setRateRequest.securityId, setRateRequest.rate, setRateRequest.rateDecimals),
      );

      expect(result).toEqual(expectedSetRateResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(FixedRate.setRate(setRateRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetRateRequest", setRateRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetRateCommand(setRateRequest.securityId, setRateRequest.rate, setRateRequest.rateDecimals),
      );
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(FixedRate.setRate(setRateRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetRateRequest", setRateRequest);

      expect(commandBusMock.execute).not.toHaveBeenCalled();
    });
  });

  describe("getRate", () => {
    beforeEach(() => {
      getRateRequest = new GetRateRequest({
        securityId: "0x1234567890123456789012345678901234567890",
      });
    });

    it("should get rate successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedGetRateResponse);

      const result = await FixedRate.getRate(getRateRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRateRequest", getRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetRateQuery(getRateRequest.securityId));

      expect(result).toEqual(expectedGetRateResponse);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(FixedRate.getRate(getRateRequest)).rejects.toThrow(error);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRateRequest", getRateRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetRateQuery(getRateRequest.securityId));
    });

    it("should throw validation error", async () => {
      const validationError = new ValidationError("Validation failed", []);
      handleValidationSpy.mockImplementation(() => {
        throw validationError;
      });

      await expect(FixedRate.getRate(getRateRequest)).rejects.toThrow("Validation failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetRateRequest", getRateRequest);

      expect(queryBusMock.execute).not.toHaveBeenCalled();
    });
  });
});
