// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationHoldersQueryFixture } from "@test/fixtures/amortization/AmortizationFixture";
import { EvmAddressPropsFixture, AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetAmortizationHoldersQueryError } from "./error/GetAmortizationHoldersQueryError";
import { GetAmortizationHoldersQuery, GetAmortizationHoldersQueryResponse } from "./GetAmortizationHoldersQuery";
import { GetAmortizationHoldersQueryHandler } from "./GetAmortizationHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";

describe("GetAmortizationHoldersQueryHandler", () => {
  let handler: GetAmortizationHoldersQueryHandler;
  let query: GetAmortizationHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationHoldersQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetAmortizationHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying amortization holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortization holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getAmortizationHolders.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationHoldersQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getAmortizationHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getAmortizationHolders).toHaveBeenCalledWith(
        evmAddress,
        query.amortizationId,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
