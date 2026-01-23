// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import AccountService from "@service/account/AccountService";
import { IsInControlListQueryFixture } from "@test/fixtures/account/AccountFixture";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsInControlListQueryError } from "./error/IsInControlListQueryError";
import { IsInControlListQueryHandler } from "./IsInControlListQueryHandler";
import { IsInControlListQuery, IsInControlListQueryResponse } from "./IsInControlListQuery";

describe("IsInControlListQueryHandler", () => {
  let handler: IsInControlListQueryHandler;
  let query: IsInControlListQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new IsInControlListQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = IsInControlListQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsInControlListQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsInControlListQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying user control list status: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully check is in control list", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      queryAdapterServiceMock.isAccountInControlList.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsInControlListQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.isAccountInControlList).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.isAccountInControlList).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
