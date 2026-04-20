// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNonceQuery, GetNonceQueryResponse } from "./GetNonceQuery";
import { GetNonceQueryHandler } from "./GetNonceQueryHandler";
import AccountService from "@service/account/AccountService";
import { GetNonceQueryFixture } from "@test/fixtures/protectedPartitions/ProtectedPartitionsFixture";
import { GetNonceQueryError } from "./error/GetNonceQueryError";
describe("GetNonceQueryHandler", () => {
  let handler: GetNonceQueryHandler;
  let query: GetNonceQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetNonceQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetNonceQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetNonceQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetNonceQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying nonce: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get nonce", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getNonceFor.mockResolvedValueOnce(BigInt(1));

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetNonceQueryResponse);
      expect(result.payload).toBe(Number(BigInt(1)));
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getNonceFor).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
