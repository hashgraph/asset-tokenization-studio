// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  ClearingTransferFixture,
  GetClearingTransferForByPartitionQueryFixture,
} from "@test/fixtures/clearing/ClearingFixture";
import SecurityService from "@service/security/SecurityService";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import { ClearingTransfer } from "@domain/context/security/Clearing";
import { GetClearingTransferForByPartitionQueryError } from "./error/GetClearingTransferForByPartitionQueryError";
import {
  GetClearingTransferForByPartitionQuery,
  GetClearingTransferForByPartitionQueryResponse,
} from "./GetClearingTransferForByPartitionQuery";
import { GetClearingTransferForByPartitionQueryHandler } from "./GetClearingTransferForByPartitionQueryHandler";

describe("GetClearingTransferForByPartitionQueryHandler", () => {
  let handler: GetClearingTransferForByPartitionQueryHandler;
  let query: GetClearingTransferForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create({ decimals: 0 }));
  const errorMsg = ErrorMsgFixture.create().msg;
  const accountDestination = new Account(AccountPropsFixture.create());
  const clearingTransferProps = ClearingTransferFixture.create();
  const clearing = new ClearingTransfer(
    clearingTransferProps.amount,
    clearingTransferProps.expirationTimestamp,
    clearingTransferProps.destination,
    clearingTransferProps.data,
    clearingTransferProps.operatorData,
  );

  beforeEach(() => {
    handler = new GetClearingTransferForByPartitionQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetClearingTransferForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearingTransferForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearingTransferForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying clearing transfers: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get clearing transfer for by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(accountDestination);

      queryAdapterServiceMock.getClearingTransferForByPartition.mockResolvedValueOnce(clearing);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearingTransferForByPartitionQueryResponse);

      expect(result.payload).toStrictEqual(clearing);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledWith(clearingTransferProps.destination);

      expect(queryAdapterServiceMock.getClearingTransferForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
        query.clearingId,
      );
    });
  });
});
