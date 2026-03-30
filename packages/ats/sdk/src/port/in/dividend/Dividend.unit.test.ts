// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  SetDividendRequest,
  GetDividendForRequest,
  GetDividendRequest,
  GetAllDividendsRequest,
  GetDividendHoldersRequest,
  GetTotalDividendHoldersRequest,
  CancelDividendRequest,
} from "../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import NetworkService from "@service/network/NetworkService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";

import DividendToken from "./Dividend";
import {
  DividendFixture,
  GetAllDividendsRequestFixture,
  GetDividendHoldersRequestFixture,
  GetDividendForRequestFixture,
  GetDividendRequestFixture,
  GetTotalDividendHoldersRequestFixture,
  SetDividendRequestFixture,
  CancelDividendRequestFixture,
} from "@test/fixtures/equity/EquityFixture";
import { SetDividendCommand } from "@command/dividend/set/SetDividendCommand";
import { CancelDividendCommand } from "@command/dividend/cancel/CancelDividendCommand";
import { GetDividendForQuery } from "@query/dividend/getDividendFor/GetDividendForQuery";
import { GetDividendQuery } from "@query/dividend/getDividend/GetDividendQuery";
import { GetDividendsCountQuery } from "@query/dividend/getDividendsCount/GetDividendsCountQuery";
import { GetDividendHoldersQuery } from "@query/dividend/getDividendHolders/GetDividendHoldersQuery";
import { GetTotalDividendHoldersQuery } from "@query/dividend/getTotalDividendHolders/GetTotalDividendHoldersQuery";
import { GetVotingCountQuery } from "@query/equity/votingRights/getVotingCount/GetVotingCountQuery";

describe("Dividend", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let setDividendRequest: SetDividendRequest;
  let getDividendForRequest: GetDividendForRequest;
  let getDividendRequest: GetDividendRequest;
  let getAllDividendsRequest: GetAllDividendsRequest;
  let getDividendHoldersRequest: GetDividendHoldersRequest;
  let getTotalDividendHoldersRequest: GetTotalDividendHoldersRequest;
  let cancelDividendRequest: CancelDividendRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const factoryAddress = HederaIdPropsFixture.create().value;
  const resolverAddress = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: factoryAddress,
        resolverAddress: resolverAddress,
      },
    });
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (DividendToken as any).commandBus = commandBusMock;
    (DividendToken as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setDividend", () => {
    setDividendRequest = new SetDividendRequest(SetDividendRequestFixture.create());
    it("should set dividends successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.setDividend(setDividendRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetDividendRequest", setDividendRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetDividendCommand(
          setDividendRequest.securityId,
          setDividendRequest.recordTimestamp,
          setDividendRequest.executionTimestamp,
          setDividendRequest.amountPerUnitOfSecurity,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.setDividend(setDividendRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetDividendRequest", setDividendRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetDividendCommand(
          setDividendRequest.securityId,
          setDividendRequest.recordTimestamp,
          setDividendRequest.executionTimestamp,
          setDividendRequest.amountPerUnitOfSecurity,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setDividendRequest = new SetDividendRequest({
        ...SetDividendRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.setDividend(setDividendRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if recordTimestamp is invalid", async () => {
      setDividendRequest = new SetDividendRequest({
        ...SetDividendRequestFixture.create(),
        recordTimestamp: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
      });

      await expect(DividendToken.setDividend(setDividendRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if executionTimestamp is invalid", async () => {
      const time = Math.ceil(new Date().getTime() / 1000);
      setDividendRequest = new SetDividendRequest({
        ...SetDividendRequestFixture.create(),
        recordTimestamp: time.toString(),
        executionTimestamp: (time - 100).toString(),
      });

      await expect(DividendToken.setDividend(setDividendRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountPerUnitOfSecurity is invalid", async () => {
      setDividendRequest = new SetDividendRequest({
        ...SetDividendRequestFixture.create(),
        amountPerUnitOfSecurity: "invalid",
      });

      await expect(DividendToken.setDividend(setDividendRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelDividend", () => {
    cancelDividendRequest = new CancelDividendRequest(CancelDividendRequestFixture.create());

    it("should cancel dividend successfully", async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.cancelDividend(cancelDividendRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CancelDividendRequest", cancelDividendRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CancelDividendCommand(cancelDividendRequest.securityId, cancelDividendRequest.dividendId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.cancelDividend(cancelDividendRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("CancelDividendRequest", cancelDividendRequest);
    });

    it("should throw error if securityId is invalid", async () => {
      cancelDividendRequest = new CancelDividendRequest({
        ...CancelDividendRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.cancelDividend(cancelDividendRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getDividendFor", () => {
    getDividendForRequest = new GetDividendForRequest(GetDividendForRequestFixture.create());
    it("should get dividends for successfully", async () => {
      const expectedResponse = {
        tokenBalance: new BigDecimal(BigInt(10)),
        decimals: 1,
        isDisabled: false,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.getDividendFor(getDividendForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendForRequest", getDividendForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendForQuery(
          getDividendForRequest.targetId,
          getDividendForRequest.securityId,
          getDividendForRequest.dividendId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          tokenBalance: expectedResponse.tokenBalance.toString(),
          decimals: expectedResponse.decimals.toString(),
          isDisabled: expectedResponse.isDisabled,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.getDividendFor(getDividendForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendForRequest", getDividendForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendForQuery(
          getDividendForRequest.targetId,
          getDividendForRequest.securityId,
          getDividendForRequest.dividendId,
        ),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getDividendForRequest = new GetDividendForRequest({
        ...GetDividendForRequestFixture.create(),
        targetId: "invalid",
      });

      await expect(DividendToken.getDividendFor(getDividendForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendForRequest = new GetDividendForRequest({
        ...GetDividendForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.getDividendFor(getDividendForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendForRequest = new GetDividendForRequest({
        ...GetDividendForRequestFixture.create(),
        dividendId: 0,
      });

      await expect(DividendToken.getDividendFor(getDividendForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getDividend", () => {
    getDividendRequest = new GetDividendRequest(GetDividendRequestFixture.create());
    it("should get dividends successfully", async () => {
      const expectedResponse = {
        dividend: DividendFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.getDividend(getDividendRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendRequest", getDividendRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendQuery(getDividendRequest.securityId, getDividendRequest.dividendId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          dividendId: getDividendRequest.dividendId,
          amountPerUnitOfSecurity: expectedResponse.dividend.amountPerUnitOfSecurity.toString(),
          recordDate: new Date(expectedResponse.dividend.recordTimeStamp * ONE_THOUSAND),
          executionDate: new Date(expectedResponse.dividend.executionTimeStamp * ONE_THOUSAND),
          isDisabled: expectedResponse.dividend.isDisabled,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.getDividend(getDividendRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendRequest", getDividendRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendQuery(getDividendRequest.securityId, getDividendRequest.dividendId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendRequest = new GetDividendRequest({
        ...GetDividendRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.getDividend(getDividendRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendRequest = new GetDividendRequest({
        ...GetDividendRequestFixture.create(),
        dividendId: -1,
      });

      await expect(DividendToken.getDividend(getDividendRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllDividends", () => {
    getAllDividendsRequest = new GetAllDividendsRequest(GetAllDividendsRequestFixture.create());
    it("should get all dividends successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        dividend: DividendFixture.create(),
      };

      queryBusMock.execute.mockResolvedValueOnce(expectedResponse).mockResolvedValueOnce(expectedResponse2);

      const result = await DividendToken.getAllDividends(getAllDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetDividendsCountQuery(getAllDividendsRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetDividendQuery(getAllDividendsRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            dividendId: 1,
            amountPerUnitOfSecurity: expectedResponse2.dividend.amountPerUnitOfSecurity.toString(),
            amountDecimals: expectedResponse2.dividend.amountDecimals,
            recordDate: new Date(expectedResponse2.dividend.recordTimeStamp * ONE_THOUSAND),
            executionDate: new Date(expectedResponse2.dividend.executionTimeStamp * ONE_THOUSAND),
            isDisabled: expectedResponse2.dividend.isDisabled,
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await DividendToken.getAllDividends(getAllDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetDividendsCountQuery(getAllDividendsRequest.securityId));

      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.getAllDividends(getAllDividendsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetVotingCountQuery(getAllDividendsRequest.securityId));
    });
  });

  describe("getDividendHolders", () => {
    getDividendHoldersRequest = new GetDividendHoldersRequest(GetDividendHoldersRequestFixture.create());
    it("should get dividend token holders successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.getDividendHolders(getDividendHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetDividendHoldersRequest.name, getDividendHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendHoldersQuery(
          getDividendHoldersRequest.securityId,
          getDividendHoldersRequest.dividendId,
          getDividendHoldersRequest.start,
          getDividendHoldersRequest.end,
        ),
      );
      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(GetDividendHoldersRequest.name, getDividendHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendHoldersQuery(
          getDividendHoldersRequest.securityId,
          getDividendHoldersRequest.dividendId,
          getDividendHoldersRequest.start,
          getDividendHoldersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        dividendId: -1,
      });

      await expect(DividendToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if start is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        start: -1,
      });

      await expect(DividendToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        end: -1,
      });

      await expect(DividendToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalDividendHolders", () => {
    getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest(GetTotalDividendHoldersRequestFixture.create());
    it("should get total dividend holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await DividendToken.getTotalDividendHolders(getTotalDividendHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalDividendHoldersRequest.name,
        getTotalDividendHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalDividendHoldersQuery(
          getTotalDividendHoldersRequest.securityId,
          getTotalDividendHoldersRequest.dividendId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(DividendToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalDividendHoldersRequest.name,
        getTotalDividendHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalDividendHoldersQuery(
          getTotalDividendHoldersRequest.securityId,
          getTotalDividendHoldersRequest.dividendId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest({
        ...GetTotalDividendHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(DividendToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if dividendId is invalid", async () => {
      getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest({
        ...GetTotalDividendHoldersRequestFixture.create(),
        dividendId: -1,
      });

      await expect(DividendToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
