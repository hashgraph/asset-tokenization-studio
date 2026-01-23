// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { GetClearedAmountForByPartitionQueryFixture } from "@test/fixtures/clearing/ClearingFixture";
import { GetClearedAmountForByPartitionQueryHandler } from "./GetClearedAmountForByPartitionQueryHandler";
import {
  GetClearedAmountForByPartitionQuery,
  GetClearedAmountForByPartitionQueryResponse,
} from "./GetClearedAmountForByPartitionQuery";
import { GetClearedAmountForByPartitionQueryError } from "./error/GetClearedAmountForByPartitionQueryError";

describe("GetClearedAmountForByPartitionQueryHandler", () => {
  let handler: GetClearedAmountForByPartitionQueryHandler;
  let query: GetClearedAmountForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetClearedAmountForByPartitionQueryHandler(
      contractServiceMock,
      queryAdapterServiceMock,
      accountServiceMock,
    );
    query = GetClearedAmountForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetClearedAmountForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetClearedAmountForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying cleared amount by partition: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get cleared amount for by partition", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getClearedAmountForByPartition.mockResolvedValueOnce(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetClearedAmountForByPartitionQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getClearedAmountForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
      );
    });
  });
});
