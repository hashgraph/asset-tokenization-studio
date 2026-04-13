// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalActiveAmortizationHoldHoldersQueryFixture } from "@test/fixtures/amortization/AmortizationFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalActiveAmortizationHoldHoldersQueryError } from "./error/GetTotalActiveAmortizationHoldHoldersQueryError";
import {
  GetTotalActiveAmortizationHoldHoldersQuery,
  GetTotalActiveAmortizationHoldHoldersQueryResponse,
} from "./GetTotalActiveAmortizationHoldHoldersQuery";
import { GetTotalActiveAmortizationHoldHoldersQueryHandler } from "./GetTotalActiveAmortizationHoldHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalActiveAmortizationHoldHoldersQueryHandler", () => {
  let handler: GetTotalActiveAmortizationHoldHoldersQueryHandler;
  let query: GetTotalActiveAmortizationHoldHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalActiveAmortizationHoldHoldersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalActiveAmortizationHoldHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalActiveAmortizationHoldHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalActiveAmortizationHoldHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while querying total active amortization hold holders: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total active amortization hold holders", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalActiveAmortizationHoldHolders.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalActiveAmortizationHoldHoldersQueryResponse);
      expect(result.payload).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalActiveAmortizationHoldHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalActiveAmortizationHoldHolders).toHaveBeenCalledWith(
        evmAddress,
        query.amortizationId,
      );
    });
  });
});
