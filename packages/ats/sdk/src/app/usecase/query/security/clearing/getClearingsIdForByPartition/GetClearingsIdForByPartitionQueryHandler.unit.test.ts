// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetClearingsIdForByPartitionQueryFixture } from "@test/fixtures/clearing/ClearingFixture";
import { GetClearingsIdForByPartitionQueryHandler } from "./GetClearingsIdForByPartitionQueryHandler";
import {
  GetClearingsIdForByPartitionQuery,
  GetClearingsIdForByPartitionQueryResponse,
} from "./GetClearingsIdForByPartitionQuery";
import { GetClearingsIdForByPartitionQueryError } from "./error/GetClearingsIdForByPartitionQueryError";

describe("GetClearingsIdForByPartitionQueryHandler", () => {
  let handler: GetClearingsIdForByPartitionQueryHandler;
  let query: GetClearingsIdForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetClearingsIdForByPartitionQueryHandler(
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetClearingsIdForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearingsIdForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearingsIdForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying clearing IDs: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get clearings id for by partition", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getClearingsIdForByPartition.mockResolvedValueOnce([1]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearingsIdForByPartitionQueryResponse);
      expect(result.payload).toStrictEqual([1]);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getClearingsIdForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
        query.clearingOperationType,
        query.start,
        query.end,
      );
    });
  });
});
