// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import {
  RegisteredAmortizationFixture,
  GetAmortizationQueryFixture,
} from "@test/fixtures/amortization/AmortizationFixture";
import { GetAmortizationQueryHandler } from "./GetAmortizationQueryHandler";
import { GetAmortizationQuery, GetAmortizationQueryResponse } from "./GetAmortizationQuery";
import { GetAmortizationQueryError } from "./error/GetAmortizationQueryError";

describe("GetAmortizationQueryHandler", () => {
  let handler: GetAmortizationQueryHandler;
  let query: GetAmortizationQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const registeredAmortization = RegisteredAmortizationFixture.create();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetAmortizationQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying amortization: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortization", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getAmortization.mockResolvedValue(registeredAmortization);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationQueryResponse);
      expect(result.amortization).toBe(registeredAmortization);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getAmortization).toHaveBeenCalledWith(evmAddress, query.amortizationId);
    });
  });
});
