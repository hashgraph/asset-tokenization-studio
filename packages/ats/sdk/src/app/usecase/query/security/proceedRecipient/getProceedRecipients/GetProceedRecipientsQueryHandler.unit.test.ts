// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { AccountPropsFixture, ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientsQueryHandler } from "./GetProceedRecipientsQueryHandler";
import { GetProceedRecipientsQuery, GetProceedRecipientsQueryResponse } from "./GetProceedRecipientsQuery";
import { GetProceedRecipientsQueryError } from "./error/GetProceedRecipientsQueryError";
import { GetProceedRecipientsQueryFixture } from "@test/fixtures/proceedRecipient/ProceedRecipientFixture";
import AccountService from "@service/account/AccountService";
import Account from "@domain/context/account/Account";

describe("GetProceedRecipientsQueryHandler", () => {
  let handler: GetProceedRecipientsQueryHandler;
  let query: GetProceedRecipientsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetProceedRecipientsQueryHandler(contractServiceMock, queryAdapterServiceMock, accountServiceMock);
    query = GetProceedRecipientsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetProceedRecipientsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);
      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetProceedRecipientsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying GetProceedRecipients: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get proceedRecipients data", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getProceedRecipients.mockResolvedValueOnce(["0x"]);

      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetProceedRecipientsQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);

      expect(queryAdapterServiceMock.getProceedRecipients).toHaveBeenCalledWith(
        evmAddress,
        query.pageIndex,
        query.pageSize,
      );
    });
  });
});
