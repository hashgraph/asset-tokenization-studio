// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetScheduledBalanceAdjustmentCountQueryFixture } from "@test/fixtures/equity/EquityFixture";
import { GetScheduledBalanceAdjustmentCountQueryHandler } from "./GetScheduledBalanceAdjustmentsCountQueryHandler";
import {
  GetScheduledBalanceAdjustmentCountQuery,
  GetScheduledBalanceAdjustmentCountQueryResponse,
} from "./GetScheduledBalanceAdjustmentsCountQuery";
import { GetScheduledBalanceAdjustmentsCountQueryError } from "./error/GetScheduledBalanceAdjustmentsCountQueryError";

describe("GetScheduledBalanceAdjustmentCountQueryHandler", () => {
  let handler: GetScheduledBalanceAdjustmentCountQueryHandler;
  let query: GetScheduledBalanceAdjustmentCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetScheduledBalanceAdjustmentCountQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetScheduledBalanceAdjustmentCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetScheduledBalanceAdjustmentsCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetScheduledBalanceAdjustmentsCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying scheduled balance adjustments count: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get scheduled balance adjustment count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getScheduledBalanceAdjustmentCount.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetScheduledBalanceAdjustmentCountQueryResponse);
      expect(result.payload).toBe(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getScheduledBalanceAdjustmentCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
