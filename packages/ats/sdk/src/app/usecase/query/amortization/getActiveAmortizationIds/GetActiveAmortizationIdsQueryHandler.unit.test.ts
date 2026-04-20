// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetActiveAmortizationIdsQueryFixture } from "@test/fixtures/amortization/AmortizationFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetActiveAmortizationIdsQueryError } from "./error/GetActiveAmortizationIdsQueryError";
import { GetActiveAmortizationIdsQuery, GetActiveAmortizationIdsQueryResponse } from "./GetActiveAmortizationIdsQuery";
import { GetActiveAmortizationIdsQueryHandler } from "./GetActiveAmortizationIdsQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetActiveAmortizationIdsQueryHandler", () => {
  let handler: GetActiveAmortizationIdsQueryHandler;
  let query: GetActiveAmortizationIdsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetActiveAmortizationIdsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetActiveAmortizationIdsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetActiveAmortizationIdsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetActiveAmortizationIdsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying active amortization IDs: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get active amortization IDs", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getActiveAmortizationIds.mockResolvedValue([1, 2, 3]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetActiveAmortizationIdsQueryResponse);
      expect(result.payload).toStrictEqual([1, 2, 3]);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getActiveAmortizationIds).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getActiveAmortizationIds).toHaveBeenCalledWith(evmAddress, query.start, query.end);
    });
  });
});
