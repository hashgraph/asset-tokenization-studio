// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetClearedAmountForQueryHandler } from "./GetClearedAmountForQueryHandler";
import { GetClearedAmountForQuery, GetClearedAmountForQueryResponse } from "./GetClearedAmountForQuery";
import AccountService from "@service/account/AccountService";
import { GetClearedAmountForQueryFixture } from "@test/fixtures/clearing/ClearingFixture";
import { GetClearedAmountForQueryError } from "./error/GetClearedAmountForQueryError";

describe("GetClearedAmountForQueryHandler", () => {
  let handler: GetClearedAmountForQueryHandler;
  let query: GetClearedAmountForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetClearedAmountForQueryHandler(contractServiceMock, queryAdapterServiceMock, accountServiceMock);
    query = GetClearedAmountForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearedAmountForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearedAmountForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying cleared amount: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get cleared amount for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getClearedAmountFor.mockResolvedValueOnce(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearedAmountForQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getClearedAmountFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
