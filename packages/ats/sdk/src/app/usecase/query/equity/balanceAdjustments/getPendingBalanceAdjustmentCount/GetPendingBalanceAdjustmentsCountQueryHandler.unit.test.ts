// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetPendingBalanceAdjustmentCountQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetPendingBalanceAdjustmentCountQueryHandler } from "./GetPendingBalanceAdjustmentsCountQueryHandler";
import {
  GetPendingBalanceAdjustmentCountQuery,
  GetPendingBalanceAdjustmentCountQueryResponse,
} from "./GetPendingBalanceAdjustmentsCountQuery";
import { GetPendingBalanceAdjustmentsCountQueryError } from "./error/GetPendingBalanceAdjustmentsCountQueryError";

describe("GetPendingBalanceAdjustmentCountQueryHandler", () => {
  let handler: GetPendingBalanceAdjustmentCountQueryHandler;
  let query: GetPendingBalanceAdjustmentCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetPendingBalanceAdjustmentCountQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetPendingBalanceAdjustmentCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetPendingBalanceAdjustmentsCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetPendingBalanceAdjustmentsCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying pending balance adjustments count: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get pending balance adjustment count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getPendingBalanceAdjustmentCount.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetPendingBalanceAdjustmentCountQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getPendingBalanceAdjustmentCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
