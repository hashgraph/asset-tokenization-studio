// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNominalValueCurrencyQuery, GetNominalValueCurrencyQueryResponse } from "./GetNominalValueCurrencyQuery";
import { GetNominalValueCurrencyQueryHandler } from "./GetNominalValueCurrencyQueryHandler";
import { GetNominalValueCurrencyQueryFixture } from "@test/fixtures/nominalValue/NominalValueFixture";
import { GetNominalValueCurrencyQueryError } from "./error/GetNominalValueCurrencyQueryError";

describe("GetNominalValueCurrencyQueryHandler", () => {
  let handler: GetNominalValueCurrencyQueryHandler;
  let query: GetNominalValueCurrencyQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetNominalValueCurrencyQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetNominalValueCurrencyQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetNominalValueCurrencyQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetNominalValueCurrencyQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying nominal value currency: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get nominal value currency", async () => {
      const currency = "0x555344"; // USD

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getNominalValueCurrency.mockResolvedValueOnce(currency);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetNominalValueCurrencyQueryResponse);
      expect(result.payload).toBe(currency);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getNominalValueCurrency).toHaveBeenCalledWith(evmAddress);
    });
  });
});
