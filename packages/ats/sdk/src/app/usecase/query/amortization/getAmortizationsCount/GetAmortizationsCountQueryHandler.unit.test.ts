// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationsCountQueryFixture } from "@test/fixtures/amortization/AmortizationFixture";
import { GetAmortizationsCountQueryHandler } from "./GetAmortizationsCountQueryHandler";
import { GetAmortizationsCountQuery, GetAmortizationsCountQueryResponse } from "./GetAmortizationsCountQuery";
import { GetAmortizationsCountQueryError } from "./error/GetAmortizationsCountQueryError";

describe("GetAmortizationsCountQueryHandler", () => {
  let handler: GetAmortizationsCountQueryHandler;
  let query: GetAmortizationsCountQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationsCountQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetAmortizationsCountQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationsCountQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationsCountQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying amortizations count: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortizations count", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getAmortizationsCount.mockResolvedValue(5);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationsCountQueryResponse);
      expect(result.payload).toStrictEqual(5);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getAmortizationsCount).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getAmortizationsCount).toHaveBeenCalledWith(evmAddress);
    });
  });
});
