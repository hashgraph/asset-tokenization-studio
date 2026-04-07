// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import {
  AmortizationForFixture,
  GetAmortizationsForQueryFixture,
} from "@test/fixtures/amortization/AmortizationFixture";
import { GetAmortizationsForQueryHandler } from "./GetAmortizationsForQueryHandler";
import { GetAmortizationsForQuery, GetAmortizationsForQueryResponse } from "./GetAmortizationsForQuery";
import { GetAmortizationsForQueryError } from "./error/GetAmortizationsForQueryError";

describe("GetAmortizationsForQueryHandler", () => {
  let handler: GetAmortizationsForQueryHandler;
  let query: GetAmortizationsForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const amortizationsFor = [AmortizationForFixture.create()];
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationsForQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetAmortizationsForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationsForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationsForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying amortizations for: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortizations for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getAmortizationsFor.mockResolvedValue(amortizationsFor);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationsForQueryResponse);
      expect(result.payload).toBe(amortizationsFor);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getAmortizationsFor).toHaveBeenCalledWith(
        evmAddress,
        query.amortizationId,
        query.start,
        query.end,
      );
    });
  });
});
