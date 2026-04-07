// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";
import {
  AmortizationForFixture,
  GetAmortizationForQueryFixture,
} from "@test/fixtures/amortization/AmortizationFixture";
import { GetAmortizationForQueryHandler } from "./GetAmortizationForQueryHandler";
import { GetAmortizationForQuery, GetAmortizationForQueryResponse } from "./GetAmortizationForQuery";
import { GetAmortizationForQueryError } from "./error/GetAmortizationForQueryError";

describe("GetAmortizationForQueryHandler", () => {
  let handler: GetAmortizationForQueryHandler;
  let query: GetAmortizationForQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const accountServiceMock = createMock<AccountService>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);

  const amortizationFor = AmortizationForFixture.create();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetAmortizationForQueryHandler(queryAdapterServiceMock, accountServiceMock, contractServiceMock);
    query = GetAmortizationForQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetAmortizationForQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetAmortizationForQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying account's amortization: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get amortization for", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      accountServiceMock.getAccountEvmAddress.mockResolvedValueOnce(targetEvmAddress);
      queryAdapterServiceMock.getAmortizationFor.mockResolvedValue(amortizationFor);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetAmortizationForQueryResponse);
      expect(result.amortizationFor).toBe(amortizationFor);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(accountServiceMock.getAccountEvmAddress).toHaveBeenCalledWith(query.targetId);
      expect(queryAdapterServiceMock.getAmortizationFor).toHaveBeenCalledWith(
        evmAddress,
        targetEvmAddress,
        query.amortizationId,
      );
    });
  });
});
