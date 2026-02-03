// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  ClearingHoldCreationFixture,
  GetClearingCreateHoldForByPartitionQueryFixture,
} from "@test/fixtures/clearing/ClearingFixture";
import { GetClearingCreateHoldForByPartitionQueryHandler } from "./GetClearingCreateHoldForByPartitionQueryHandler";
import {
  GetClearingCreateHoldForByPartitionQuery,
  GetClearingCreateHoldForByPartitionQueryResponse,
} from "./GetClearingCreateHoldForByPartitionQuery";
import SecurityService from "@service/security/SecurityService";
import { GetClearingCreateHoldForByPartitionQueryError } from "./error/GetClearingCreateHoldForByPartitionQueryError";
import { Security } from "@domain/context/security/Security";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import { ClearingHoldCreation } from "@domain/context/security/Clearing";

describe("GetClearingCreateHoldForByPartitionQueryHandler", () => {
  let handler: GetClearingCreateHoldForByPartitionQueryHandler;
  let query: GetClearingCreateHoldForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();
  const securityServiceMock = createMock<SecurityService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create({ decimals: 0 }));
  const errorMsg = ErrorMsgFixture.create().msg;
  const accountEscrow = new Account(AccountPropsFixture.create());
  const accountHoldTo = new Account(AccountPropsFixture.create());
  const clearingHoldProps = ClearingHoldCreationFixture.create();
  const clearingHold = new ClearingHoldCreation(
    clearingHoldProps.amount,
    clearingHoldProps.expirationTimestamp,
    clearingHoldProps.data,
    clearingHoldProps.operatorData,
    clearingHoldProps.holdEscrowId,
    clearingHoldProps.holdExpirationTimestamp,
    clearingHoldProps.holdTo,
    clearingHoldProps.holdData,
  );

  beforeEach(() => {
    handler = new GetClearingCreateHoldForByPartitionQueryHandler(
      securityServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetClearingCreateHoldForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearingCreateHoldForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      securityServiceMock.get.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearingCreateHoldForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying clearing create hold: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get clearing create hold for by partition", async () => {
      securityServiceMock.get.mockResolvedValueOnce(security);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      accountServiceMock.getAccountInfo.mockResolvedValueOnce(accountEscrow).mockResolvedValueOnce(accountHoldTo);

      queryAdapterServiceMock.getClearingCreateHoldForByPartition.mockResolvedValueOnce(clearingHold);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearingCreateHoldForByPartitionQueryResponse);

      expect(result.payload).toStrictEqual(clearingHold);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountInfo).toHaveBeenCalledTimes(2);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);

      expect(accountServiceMock.getAccountInfo).toHaveBeenNthCalledWith(1, clearingHoldProps.holdEscrowId);
      expect(accountServiceMock.getAccountInfo).toHaveBeenNthCalledWith(2, clearingHoldProps.holdTo);

      expect(queryAdapterServiceMock.getClearingCreateHoldForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
        query.clearingId,
      );
    });
  });
});
