// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetScheduledBalanceAdjustmentQueryHandler } from "./GetScheduledBalanceAdjustmentQueryHandler";
import {
  GetScheduledBalanceAdjustmentQuery,
  GetScheduledBalanceAdjustmentQueryResponse,
} from "./GetScheduledBalanceAdjustmentQuery";
import ContractService from "@service/contract/ContractService";
import { GetScheduledBalanceAdjustmentQueryError } from "./error/GetScheduledBalanceAdjustmentQueryError";
import {
  GetScheduledBalanceAdjustmentQueryFixture,
  ScheduledBalanceAdjustmentFixture,
} from "@test/fixtures/equity/EquityFixture";

describe("GetScheduledBalanceAdjustmentQueryHandler", () => {
  let handler: GetScheduledBalanceAdjustmentQueryHandler;
  let query: GetScheduledBalanceAdjustmentQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const errorMsg = ErrorMsgFixture.create().msg;
  const scheduledBalanceAdjustment = ScheduledBalanceAdjustmentFixture.create();

  beforeEach(() => {
    handler = new GetScheduledBalanceAdjustmentQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetScheduledBalanceAdjustmentQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetScheduledBalanceAdjustmentQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetScheduledBalanceAdjustmentQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying scheduled balance adjustment: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });
    it("should successfully get scheduled balance adjustment", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getScheduledBalanceAdjustment.mockResolvedValue(scheduledBalanceAdjustment);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetScheduledBalanceAdjustmentQueryResponse);
      expect(result.scheduleBalanceAdjustment).toBe(scheduledBalanceAdjustment);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getScheduledBalanceAdjustment).toHaveBeenCalledWith(
        evmAddress,
        query.balanceAdjustmentId,
      );
    });
  });
});
