// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalActiveAmortizationIdsQueryFixture } from "@test/fixtures/amortization/AmortizationFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalActiveAmortizationIdsQueryError } from "./error/GetTotalActiveAmortizationIdsQueryError";
import {
  GetTotalActiveAmortizationIdsQuery,
  GetTotalActiveAmortizationIdsQueryResponse,
} from "./GetTotalActiveAmortizationIdsQuery";
import { GetTotalActiveAmortizationIdsQueryHandler } from "./GetTotalActiveAmortizationIdsQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalActiveAmortizationIdsQueryHandler", () => {
  let handler: GetTotalActiveAmortizationIdsQueryHandler;
  let query: GetTotalActiveAmortizationIdsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalActiveAmortizationIdsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalActiveAmortizationIdsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalActiveAmortizationIdsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalActiveAmortizationIdsQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying total active amortization IDs: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total active amortization IDs", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalActiveAmortizationIds.mockResolvedValue(5);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalActiveAmortizationIdsQueryResponse);
      expect(result.payload).toStrictEqual(5);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalActiveAmortizationIds).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalActiveAmortizationIds).toHaveBeenCalledWith(evmAddress);
    });
  });
});
