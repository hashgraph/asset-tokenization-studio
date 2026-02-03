// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { EvmAddressPropsFixture, AccountPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTokenHoldersAtSnapshotQueryFixture } from "@test/fixtures/snapshot/SnapshotFixture";
import { GetTokenHoldersAtSnapshotQueryError } from "./error/GetTokenHoldersAtSnapshotQueryError";
import {
  GetTokenHoldersAtSnapshotQuery,
  GetTokenHoldersAtSnapshotQueryResponse,
} from "./GetTokenHoldersAtSnapshotQuery";
import { GetTokenHoldersAtSnapshotQueryHandler } from "./GetTokenHoldersAtSnapshotQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";
import Account from "@domain/context/account/Account";

describe("GetTokenHoldersAtSnapshotQueryHandler", () => {
  let handler: GetTokenHoldersAtSnapshotQueryHandler;
  let query: GetTokenHoldersAtSnapshotQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const account = new Account(AccountPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTokenHoldersAtSnapshotQueryHandler(
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetTokenHoldersAtSnapshotQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTokenHoldersAtSnapshotQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTokenHoldersAtSnapshotQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying token holders at snapshot: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get token holders at snapshot", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTokenHoldersAtSnapshot.mockResolvedValue([evmAddress.toString()]);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(account);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTokenHoldersAtSnapshotQueryResponse);
      expect(result.payload).toStrictEqual([account.id.toString()]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTokenHoldersAtSnapshot).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTokenHoldersAtSnapshot).toHaveBeenCalledWith(
        evmAddress,
        query.snapshotId,
        query.start,
        query.end,
      );
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(evmAddress.toString());
    });
  });
});
