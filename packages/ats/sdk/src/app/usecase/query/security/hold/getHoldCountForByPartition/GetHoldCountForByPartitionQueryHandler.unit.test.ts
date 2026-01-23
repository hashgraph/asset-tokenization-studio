// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  GetHoldCountForByPartitionQuery,
  GetHoldCountForByPartitionQueryResponse,
} from "./GetHoldCountForByPartitionQuery";
import { GetHoldCountForByPartitionQueryHandler } from "./GetHoldCountForByPartitionQueryHandler";
import { GetHoldCountForByPartitionQueryFixture } from "@test/fixtures/hold/HoldFixture";
import { GetHoldCountForByPartitionQueryError } from "./error/GetHoldCountForByPartitionQueryError";

describe("GetHoldCountForByPartitionQueryHandler", () => {
  let handler: GetHoldCountForByPartitionQueryHandler;
  let query: GetHoldCountForByPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetHoldCountForByPartitionQueryHandler(
      queryAdapterServiceMock,
      accountServiceMock,
      contractServiceMock,
    );
    query = GetHoldCountForByPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetHoldCountForByPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetHoldCountForByPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying hold count: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get hold count for by partition", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getHoldCountForByPartition.mockResolvedValueOnce(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetHoldCountForByPartitionQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getHoldCountForByPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        targetEvmAddress,
      );
    });
  });
});
