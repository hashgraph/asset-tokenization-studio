// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsProceedRecipientQueryHandler } from "./IsProceedRecipientQueryHandler";
import { IsProceedRecipientQuery, IsProceedRecipientQueryResponse } from "./IsProceedRecipientQuery";
import AccountService from "@service/account/AccountService";
import { IsProceedRecipientQueryError } from "./error/IsProceedRecipientQueryError";
import { IsProceedRecipientQueryFixture } from "@test/fixtures/proceedRecipient/ProceedRecipientFixture";

describe("IsProceedRecipientQueryHandler", () => {
  let handler: IsProceedRecipientQueryHandler;
  let query: IsProceedRecipientQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new IsProceedRecipientQueryHandler(contractServiceMock, queryAdapterServiceMock, accountServiceMock);
    query = IsProceedRecipientQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsProceedRecipientQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);
      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsProceedRecipientQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying isProceedRecipient: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get data", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.isProceedRecipient.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsProceedRecipientQueryResponse);
      expect(result.payload).toStrictEqual(true);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.isProceedRecipient).toHaveBeenCalledWith(evmAddress, targetEvmAddress);
    });
  });
});
