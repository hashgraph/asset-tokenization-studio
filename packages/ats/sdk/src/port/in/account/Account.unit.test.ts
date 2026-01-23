// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import AccountIntPort from "./Account";
import { QueryBus } from "@core/query/QueryBus";
import { GetAccountBalanceRequest, GetAccountInfoRequest } from "../request";
import LogService from "@service/log/LogService";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import {
  AccountPropsFixture,
  GetAccountBalanceRequestFixture,
  GetAccountInfoRequestFixture,
} from "@test/fixtures/account/AccountFixture";
import { GetAccountInfoQuery } from "@query/account/info/GetAccountInfoQuery";
import { HederaId } from "@domain/context/shared/HederaId";
import { GetAccountBalanceQuery } from "@query/account/balance/GetAccountBalanceQuery";
import { ValidationError } from "@core/validation/ValidationError";
import Account from "@domain/context/account/Account";

describe("Account", () => {
  let queryBusMock: jest.Mocked<QueryBus>;
  let getAccountInfoRequest: GetAccountInfoRequest;
  let getAccountBalanceRequest: GetAccountBalanceRequest;

  let handleValidationSpy: jest.SpyInstance;

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (AccountIntPort as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("getInfo", () => {
    getAccountInfoRequest = new GetAccountInfoRequest(GetAccountInfoRequestFixture.create());

    const expectedQueryResponse = {
      account: new Account(AccountPropsFixture.create()),
    };

    it("should return AccountViewModel when getInfo is called with valid request", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await AccountIntPort.getInfo(getAccountInfoRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountInfoRequest", getAccountInfoRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAccountInfoQuery(HederaId.from(getAccountInfoRequest.account.accountId)),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: expectedQueryResponse.account.id.toString(),
        }),
      );
    });

    it("should throw error when query execution fails", async () => {
      const queryError = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(queryError);

      await expect(AccountIntPort.getInfo(getAccountInfoRequest)).rejects.toThrow(queryError);
      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountInfoRequest", getAccountInfoRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAccountInfoQuery(HederaId.from(getAccountInfoRequest.account.accountId)),
      );
    });
  });

  describe("getBalance", () => {
    getAccountBalanceRequest = new GetAccountBalanceRequest(GetAccountBalanceRequestFixture.create());

    const expectedQueryResponse = {
      payload: 1,
    };

    it("should return BigDecimal when getBalance is called with valid request", async () => {
      queryBusMock.execute.mockResolvedValue(expectedQueryResponse);

      const result = await AccountIntPort.getBalance(getAccountBalanceRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountBalanceRequest", getAccountBalanceRequest);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetAccountBalanceQuery(getAccountBalanceRequest.securityId, getAccountBalanceRequest.targetId),
      );
      expect(result).toEqual(expectedQueryResponse.payload);
    });

    it("should throw error when QueryBus execution fails", async () => {
      const queryError = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(queryError);

      await expect(AccountIntPort.getBalance(getAccountBalanceRequest)).rejects.toThrow(queryError);
      expect(handleValidationSpy).toHaveBeenCalledWith("GetAccountBalanceRequest", getAccountBalanceRequest);
      expect(queryBusMock.execute).toHaveBeenCalled();
    });

    it("should throw error if securityId is invalid", async () => {
      getAccountBalanceRequest = new GetAccountBalanceRequest({
        ...GetAccountBalanceRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(AccountIntPort.getBalance(getAccountBalanceRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if targetId is invalid", async () => {
      getAccountBalanceRequest = new GetAccountBalanceRequest({
        ...GetAccountBalanceRequestFixture.create({
          targetId: "invalid",
        }),
      });

      await expect(AccountIntPort.getBalance(getAccountBalanceRequest)).rejects.toThrow(ValidationError);
    });
  });
});
