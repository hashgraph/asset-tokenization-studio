// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientDataQueryHandler } from "./GetProceedRecipientDataQueryHandler";
import { GetProceedRecipientDataQuery, GetProceedRecipientDataQueryResponse } from "./GetProceedRecipientDataQuery";
import AccountService from "@service/account/AccountService";
import { GetProceedRecipientDataQueryError } from "./error/GetProceedRecipientDataQueryError";
import { GetProceedRecipientDataQueryFixture } from "@test/fixtures/proceedRecipient/ProceedRecipientFixture";

describe("GetProceedRecipientDataQueryHandler", () => {
  let handler: GetProceedRecipientDataQueryHandler;
  let query: GetProceedRecipientDataQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetProceedRecipientDataQueryHandler(contractServiceMock, queryAdapterServiceMock, accountServiceMock);
    query = GetProceedRecipientDataQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetProceedRecipientDataQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);
      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetProceedRecipientDataQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying GetProceedRecipientData: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get proceed recipient data", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);

      queryAdapterServiceMock.getProceedRecipientData.mockResolvedValueOnce("0x123");

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetProceedRecipientDataQueryResponse);
      expect(result.payload).toStrictEqual("0x123");

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getProceedRecipientData).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
