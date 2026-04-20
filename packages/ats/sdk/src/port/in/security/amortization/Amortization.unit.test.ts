// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  SetAmortizationRequest,
  CancelAmortizationRequest,
  SetAmortizationHoldRequest,
  ReleaseAmortizationHoldRequest,
  GetAmortizationRequest,
  GetAmortizationForRequest,
  GetAmortizationsForRequest,
  GetAmortizationsCountRequest,
  GetAmortizationHoldersRequest,
  GetTotalAmortizationHoldersRequest,
  GetAmortizationPaymentAmountRequest,
  GetActiveAmortizationHoldHoldersRequest,
  GetTotalActiveAmortizationHoldHoldersRequest,
  GetActiveAmortizationIdsRequest,
  GetTotalActiveAmortizationIdsRequest,
} from "../../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";

import AmortizationToken from "./Amortization";
import {
  RegisteredAmortizationFixture,
  AmortizationForFixture,
  AmortizationPaymentAmountFixture,
  SetAmortizationRequestFixture,
  CancelAmortizationRequestFixture,
  SetAmortizationHoldRequestFixture,
  ReleaseAmortizationHoldRequestFixture,
  GetAmortizationRequestFixture,
  GetAmortizationForRequestFixture,
  GetAmortizationsForRequestFixture,
  GetAmortizationsCountRequestFixture,
  GetAmortizationHoldersRequestFixture,
  GetTotalAmortizationHoldersRequestFixture,
  GetAmortizationPaymentAmountRequestFixture,
  GetActiveAmortizationHoldHoldersRequestFixture,
  GetTotalActiveAmortizationHoldHoldersRequestFixture,
  GetActiveAmortizationIdsRequestFixture,
  GetTotalActiveAmortizationIdsRequestFixture,
} from "@test/fixtures/amortization/AmortizationFixture";
import { SetAmortizationCommand } from "@command/amortization/set/SetAmortizationCommand";
import { CancelAmortizationCommand } from "@command/amortization/cancel/CancelAmortizationCommand";
import { SetAmortizationHoldCommand } from "@command/amortization/setHold/SetAmortizationHoldCommand";
import { ReleaseAmortizationHoldCommand } from "@command/amortization/releaseHold/ReleaseAmortizationHoldCommand";
import { GetAmortizationQuery } from "@query/amortization/getAmortization/GetAmortizationQuery";
import { GetAmortizationForQuery } from "@query/amortization/getAmortizationFor/GetAmortizationForQuery";
import { GetAmortizationsForQuery } from "@query/amortization/getAmortizationsFor/GetAmortizationsForQuery";
import { GetAmortizationsCountQuery } from "@query/amortization/getAmortizationsCount/GetAmortizationsCountQuery";
import { GetAmortizationHoldersQuery } from "@query/amortization/getAmortizationHolders/GetAmortizationHoldersQuery";
import { GetTotalAmortizationHoldersQuery } from "@query/amortization/getTotalAmortizationHolders/GetTotalAmortizationHoldersQuery";
import { GetAmortizationPaymentAmountQuery } from "@query/amortization/getAmortizationPaymentAmount/GetAmortizationPaymentAmountQuery";
import { GetActiveAmortizationHoldHoldersQuery } from "@query/amortization/getActiveAmortizationHoldHolders/GetActiveAmortizationHoldHoldersQuery";
import { GetTotalActiveAmortizationHoldHoldersQuery } from "@query/amortization/getTotalActiveAmortizationHoldHolders/GetTotalActiveAmortizationHoldHoldersQuery";
import { GetActiveAmortizationIdsQuery } from "@query/amortization/getActiveAmortizationIds/GetActiveAmortizationIdsQuery";
import { GetTotalActiveAmortizationIdsQuery } from "@query/amortization/getTotalActiveAmortizationIds/GetTotalActiveAmortizationIdsQuery";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";

describe("Amortization", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;

  let setAmortizationRequest: SetAmortizationRequest;
  let cancelAmortizationRequest: CancelAmortizationRequest;
  let setAmortizationHoldRequest: SetAmortizationHoldRequest;
  let releaseAmortizationHoldRequest: ReleaseAmortizationHoldRequest;
  let getAmortizationRequest: GetAmortizationRequest;
  let getAmortizationForRequest: GetAmortizationForRequest;
  let getAmortizationsForRequest: GetAmortizationsForRequest;
  let getAmortizationsCountRequest: GetAmortizationsCountRequest;
  let getAmortizationHoldersRequest: GetAmortizationHoldersRequest;
  let getTotalAmortizationHoldersRequest: GetTotalAmortizationHoldersRequest;
  let getAmortizationPaymentAmountRequest: GetAmortizationPaymentAmountRequest;
  let getActiveAmortizationHoldHoldersRequest: GetActiveAmortizationHoldHoldersRequest;
  let getTotalActiveAmortizationHoldHoldersRequest: GetTotalActiveAmortizationHoldHoldersRequest;
  let getActiveAmortizationIdsRequest: GetActiveAmortizationIdsRequest;
  let getTotalActiveAmortizationIdsRequest: GetTotalActiveAmortizationIdsRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (AmortizationToken as any).commandBus = commandBusMock;
    (AmortizationToken as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setAmortization", () => {
    setAmortizationRequest = new SetAmortizationRequest(SetAmortizationRequestFixture.create());

    it("should set amortization successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.setAmortization(setAmortizationRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetAmortizationRequest", setAmortizationRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetAmortizationCommand(
          setAmortizationRequest.securityId,
          setAmortizationRequest.recordTimestamp,
          setAmortizationRequest.executionTimestamp,
          setAmortizationRequest.tokensToRedeem,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.setAmortization(setAmortizationRequest)).rejects.toThrow(
        "Command execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setAmortizationRequest = new SetAmortizationRequest({
        ...SetAmortizationRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.setAmortization(setAmortizationRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelAmortization", () => {
    cancelAmortizationRequest = new CancelAmortizationRequest(CancelAmortizationRequestFixture.create());

    it("should cancel amortization successfully", async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.cancelAmortization(cancelAmortizationRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CancelAmortizationRequest", cancelAmortizationRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelAmortizationCommand(cancelAmortizationRequest.securityId, cancelAmortizationRequest.amortizationId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.cancelAmortization(cancelAmortizationRequest)).rejects.toThrow(
        "Command execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      cancelAmortizationRequest = new CancelAmortizationRequest({
        ...CancelAmortizationRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.cancelAmortization(cancelAmortizationRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("setAmortizationHold", () => {
    setAmortizationHoldRequest = new SetAmortizationHoldRequest(SetAmortizationHoldRequestFixture.create());

    it("should set amortization hold successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.setAmortizationHold(setAmortizationHoldRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetAmortizationHoldRequest", setAmortizationHoldRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetAmortizationHoldCommand(
          setAmortizationHoldRequest.securityId,
          setAmortizationHoldRequest.amortizationId,
          setAmortizationHoldRequest.tokenHolder,
          setAmortizationHoldRequest.tokenAmount,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.setAmortizationHold(setAmortizationHoldRequest)).rejects.toThrow(
        "Command execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setAmortizationHoldRequest = new SetAmortizationHoldRequest({
        ...SetAmortizationHoldRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.setAmortizationHold(setAmortizationHoldRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if tokenHolder is invalid", async () => {
      setAmortizationHoldRequest = new SetAmortizationHoldRequest({
        ...SetAmortizationHoldRequestFixture.create(),
        tokenHolder: "invalid",
      });

      await expect(AmortizationToken.setAmortizationHold(setAmortizationHoldRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("releaseAmortizationHold", () => {
    releaseAmortizationHoldRequest = new ReleaseAmortizationHoldRequest(ReleaseAmortizationHoldRequestFixture.create());

    it("should release amortization hold successfully", async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.releaseAmortizationHold(releaseAmortizationHoldRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ReleaseAmortizationHoldRequest",
        releaseAmortizationHoldRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new ReleaseAmortizationHoldCommand(
          releaseAmortizationHoldRequest.securityId,
          releaseAmortizationHoldRequest.amortizationId,
          releaseAmortizationHoldRequest.tokenHolder,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.releaseAmortizationHold(releaseAmortizationHoldRequest)).rejects.toThrow(
        "Command execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      releaseAmortizationHoldRequest = new ReleaseAmortizationHoldRequest({
        ...ReleaseAmortizationHoldRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.releaseAmortizationHold(releaseAmortizationHoldRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getAmortization", () => {
    getAmortizationRequest = new GetAmortizationRequest(GetAmortizationRequestFixture.create());

    it("should get amortization successfully", async () => {
      const registeredAmortization = RegisteredAmortizationFixture.create();
      const expectedResponse = {
        amortization: registeredAmortization,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortization(getAmortizationRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAmortizationRequest", getAmortizationRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationQuery(getAmortizationRequest.securityId, getAmortizationRequest.amortizationId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          amortizationId: getAmortizationRequest.amortizationId,
          recordDate: new Date(registeredAmortization.amortization.recordDate * ONE_THOUSAND),
          executionDate: new Date(registeredAmortization.amortization.executionDate * ONE_THOUSAND),
          tokensToRedeem: registeredAmortization.amortization.tokensToRedeem.toString(),
          snapshotId: registeredAmortization.snapshotId,
          isDisabled: registeredAmortization.isDisabled,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortization(getAmortizationRequest)).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      getAmortizationRequest = new GetAmortizationRequest({
        ...GetAmortizationRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getAmortization(getAmortizationRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllAmortizations", () => {
    getAmortizationsCountRequest = new GetAmortizationsCountRequest(GetAmortizationsCountRequestFixture.create());

    it("should get all amortizations successfully", async () => {
      const registeredAmortization = RegisteredAmortizationFixture.create();
      const countResponse = { payload: 1 };
      const amortizationResponse = { amortization: registeredAmortization };

      queryBusMock.execute.mockResolvedValueOnce(countResponse).mockResolvedValueOnce(amortizationResponse);

      const result = await AmortizationToken.getAllAmortizations(getAmortizationsCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAmortizationsCountRequest", getAmortizationsCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetAmortizationsCountQuery(getAmortizationsCountRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetAmortizationQuery(getAmortizationsCountRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            amortizationId: 1,
            recordDate: new Date(registeredAmortization.amortization.recordDate * ONE_THOUSAND),
            executionDate: new Date(registeredAmortization.amortization.executionDate * ONE_THOUSAND),
            tokensToRedeem: registeredAmortization.amortization.tokensToRedeem.toString(),
            snapshotId: registeredAmortization.snapshotId,
            isDisabled: registeredAmortization.isDisabled,
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const countResponse = { payload: 0 };
      queryBusMock.execute.mockResolvedValueOnce(countResponse);

      const result = await AmortizationToken.getAllAmortizations(getAmortizationsCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationsCountQuery(getAmortizationsCountRequest.securityId),
      );
      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAllAmortizations(getAmortizationsCountRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });
  });

  describe("getAmortizationFor", () => {
    getAmortizationForRequest = new GetAmortizationForRequest(GetAmortizationForRequestFixture.create());

    it("should get amortization for successfully", async () => {
      const amortizationFor = AmortizationForFixture.create();
      const expectedResponse = { amortizationFor };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortizationFor(getAmortizationForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAmortizationForRequest", getAmortizationForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationForQuery(
          getAmortizationForRequest.securityId,
          getAmortizationForRequest.targetId,
          getAmortizationForRequest.amortizationId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          account: amortizationFor.account,
          holdId: amortizationFor.holdId,
          holdActive: amortizationFor.holdActive,
          decimalsHeld: amortizationFor.decimalsHeld,
          decimalsBalance: amortizationFor.decimalsBalance,
          recordDateReached: amortizationFor.recordDateReached,
          nominalValueDecimals: amortizationFor.nominalValueDecimals,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortizationFor(getAmortizationForRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getAmortizationForRequest = new GetAmortizationForRequest({
        ...GetAmortizationForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getAmortizationFor(getAmortizationForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAmortizationsFor", () => {
    getAmortizationsForRequest = new GetAmortizationsForRequest(GetAmortizationsForRequestFixture.create());

    it("should get amortizations for successfully", async () => {
      const amortizationsFor = [AmortizationForFixture.create()];
      const expectedResponse = { payload: amortizationsFor };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortizationsFor(getAmortizationsForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAmortizationsForRequest", getAmortizationsForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationsForQuery(
          getAmortizationsForRequest.securityId,
          getAmortizationsForRequest.amortizationId,
          getAmortizationsForRequest.start,
          getAmortizationsForRequest.end,
        ),
      );

      expect(result).toHaveLength(1);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortizationsFor(getAmortizationsForRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });
  });

  describe("getAmortizationsCount", () => {
    getAmortizationsCountRequest = new GetAmortizationsCountRequest(GetAmortizationsCountRequestFixture.create());

    it("should get amortizations count successfully", async () => {
      const expectedResponse = { payload: 5 };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortizationsCount(getAmortizationsCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAmortizationsCountRequest", getAmortizationsCountRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationsCountQuery(getAmortizationsCountRequest.securityId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortizationsCount(getAmortizationsCountRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getAmortizationsCountRequest = new GetAmortizationsCountRequest({
        ...GetAmortizationsCountRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getAmortizationsCount(getAmortizationsCountRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getAmortizationHolders", () => {
    getAmortizationHoldersRequest = new GetAmortizationHoldersRequest(GetAmortizationHoldersRequestFixture.create());

    it("should get amortization holders successfully", async () => {
      const holderId = HederaIdPropsFixture.create().value;
      const expectedResponse = { payload: [holderId] };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortizationHolders(getAmortizationHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetAmortizationHoldersRequest.name,
        getAmortizationHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationHoldersQuery(
          getAmortizationHoldersRequest.securityId,
          getAmortizationHoldersRequest.amortizationId,
          getAmortizationHoldersRequest.start,
          getAmortizationHoldersRequest.end,
        ),
      );

      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortizationHolders(getAmortizationHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getAmortizationHoldersRequest = new GetAmortizationHoldersRequest({
        ...GetAmortizationHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getAmortizationHolders(getAmortizationHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getTotalAmortizationHolders", () => {
    getTotalAmortizationHoldersRequest = new GetTotalAmortizationHoldersRequest(
      GetTotalAmortizationHoldersRequestFixture.create(),
    );

    it("should get total amortization holders successfully", async () => {
      const expectedResponse = { payload: 3 };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getTotalAmortizationHolders(getTotalAmortizationHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalAmortizationHoldersRequest.name,
        getTotalAmortizationHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalAmortizationHoldersQuery(
          getTotalAmortizationHoldersRequest.securityId,
          getTotalAmortizationHoldersRequest.amortizationId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getTotalAmortizationHolders(getTotalAmortizationHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalAmortizationHoldersRequest = new GetTotalAmortizationHoldersRequest({
        ...GetTotalAmortizationHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getTotalAmortizationHolders(getTotalAmortizationHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getAmortizationPaymentAmount", () => {
    getAmortizationPaymentAmountRequest = new GetAmortizationPaymentAmountRequest(
      GetAmortizationPaymentAmountRequestFixture.create(),
    );

    it("should get amortization payment amount successfully", async () => {
      const paymentAmount = AmortizationPaymentAmountFixture.create();
      const expectedResponse = { amortizationPaymentAmount: paymentAmount };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getAmortizationPaymentAmount(getAmortizationPaymentAmountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetAmortizationPaymentAmountRequest",
        getAmortizationPaymentAmountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAmortizationPaymentAmountQuery(
          getAmortizationPaymentAmountRequest.securityId,
          getAmortizationPaymentAmountRequest.amortizationId,
          getAmortizationPaymentAmountRequest.tokenHolder,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          tokenAmount: paymentAmount.tokenAmount.toString(),
          decimals: paymentAmount.decimals,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getAmortizationPaymentAmount(getAmortizationPaymentAmountRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getAmortizationPaymentAmountRequest = new GetAmortizationPaymentAmountRequest({
        ...GetAmortizationPaymentAmountRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getAmortizationPaymentAmount(getAmortizationPaymentAmountRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getActiveAmortizationHoldHolders", () => {
    getActiveAmortizationHoldHoldersRequest = new GetActiveAmortizationHoldHoldersRequest(
      GetActiveAmortizationHoldHoldersRequestFixture.create(),
    );

    it("should get active amortization hold holders successfully", async () => {
      const holderId = HederaIdPropsFixture.create().value;
      const expectedResponse = { payload: [holderId] };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getActiveAmortizationHoldHolders(getActiveAmortizationHoldHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetActiveAmortizationHoldHoldersRequest.name,
        getActiveAmortizationHoldHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetActiveAmortizationHoldHoldersQuery(
          getActiveAmortizationHoldHoldersRequest.securityId,
          getActiveAmortizationHoldHoldersRequest.amortizationId,
          getActiveAmortizationHoldHoldersRequest.start,
          getActiveAmortizationHoldHoldersRequest.end,
        ),
      );

      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        AmortizationToken.getActiveAmortizationHoldHolders(getActiveAmortizationHoldHoldersRequest),
      ).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      getActiveAmortizationHoldHoldersRequest = new GetActiveAmortizationHoldHoldersRequest({
        ...GetActiveAmortizationHoldHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(
        AmortizationToken.getActiveAmortizationHoldHolders(getActiveAmortizationHoldHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalActiveAmortizationHoldHolders", () => {
    getTotalActiveAmortizationHoldHoldersRequest = new GetTotalActiveAmortizationHoldHoldersRequest(
      GetTotalActiveAmortizationHoldHoldersRequestFixture.create(),
    );

    it("should get total active amortization hold holders successfully", async () => {
      const expectedResponse = { payload: 2 };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getTotalActiveAmortizationHoldHolders(
        getTotalActiveAmortizationHoldHoldersRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalActiveAmortizationHoldHoldersRequest.name,
        getTotalActiveAmortizationHoldHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalActiveAmortizationHoldHoldersQuery(
          getTotalActiveAmortizationHoldHoldersRequest.securityId,
          getTotalActiveAmortizationHoldHoldersRequest.amortizationId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        AmortizationToken.getTotalActiveAmortizationHoldHolders(getTotalActiveAmortizationHoldHoldersRequest),
      ).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalActiveAmortizationHoldHoldersRequest = new GetTotalActiveAmortizationHoldHoldersRequest({
        ...GetTotalActiveAmortizationHoldHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(
        AmortizationToken.getTotalActiveAmortizationHoldHolders(getTotalActiveAmortizationHoldHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getActiveAmortizationIds", () => {
    getActiveAmortizationIdsRequest = new GetActiveAmortizationIdsRequest(
      GetActiveAmortizationIdsRequestFixture.create(),
    );

    it("should get active amortization IDs successfully", async () => {
      const expectedResponse = { payload: [1, 2, 3] };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getActiveAmortizationIds(getActiveAmortizationIdsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetActiveAmortizationIdsRequest.name,
        getActiveAmortizationIdsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetActiveAmortizationIdsQuery(
          getActiveAmortizationIdsRequest.securityId,
          getActiveAmortizationIdsRequest.start,
          getActiveAmortizationIdsRequest.end,
        ),
      );

      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(AmortizationToken.getActiveAmortizationIds(getActiveAmortizationIdsRequest)).rejects.toThrow(
        "Query execution failed",
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getActiveAmortizationIdsRequest = new GetActiveAmortizationIdsRequest({
        ...GetActiveAmortizationIdsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(AmortizationToken.getActiveAmortizationIds(getActiveAmortizationIdsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getTotalActiveAmortizationIds", () => {
    getTotalActiveAmortizationIdsRequest = new GetTotalActiveAmortizationIdsRequest(
      GetTotalActiveAmortizationIdsRequestFixture.create(),
    );

    it("should get total active amortization IDs successfully", async () => {
      const expectedResponse = { payload: 7 };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await AmortizationToken.getTotalActiveAmortizationIds(getTotalActiveAmortizationIdsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalActiveAmortizationIdsRequest.name,
        getTotalActiveAmortizationIdsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalActiveAmortizationIdsQuery(getTotalActiveAmortizationIdsRequest.securityId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        AmortizationToken.getTotalActiveAmortizationIds(getTotalActiveAmortizationIdsRequest),
      ).rejects.toThrow("Query execution failed");
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalActiveAmortizationIdsRequest = new GetTotalActiveAmortizationIdsRequest({
        ...GetTotalActiveAmortizationIdsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(
        AmortizationToken.getTotalActiveAmortizationIds(getTotalActiveAmortizationIdsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });
});
