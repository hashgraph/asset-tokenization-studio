// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import { IsOperatorForPartitionQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { IsOperatorForPartitionQuery, IsOperatorForPartitionQueryResponse } from "./IsOperatorForPartitionQuery";
import { IsOperatorForPartitionQueryHandler } from "./IsOperatorForPartitionQueryHandler";
import { IsOperatorForPartitionQueryError } from "./error/IsOperatorForPartitionQuery";

describe("IsOperatorForPartitionQueryHandler", () => {
  let handler: IsOperatorForPartitionQueryHandler;
  let query: IsOperatorForPartitionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const accountServiceMock = createMock<AccountService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const operatorEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new IsOperatorForPartitionQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = IsOperatorForPartitionQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsOperatorForPartitionQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsOperatorForPartitionQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying if account is operator for partition: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if is operator for partition", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress
        .mockResolvedValueOnce(operatorEvmAddress)
        .mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.isOperatorForPartition.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsOperatorForPartitionQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(2);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(1, query.operatorId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenNthCalledWith(2, query.targetId);
      expect(queryAdapterServiceMock.isOperatorForPartition).toHaveBeenCalledWith(
        evmAddress,
        query.partitionId,
        operatorEvmAddress,
        targetEvmAddress,
      );
    });
  });
});
