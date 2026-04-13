// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNominalValueDecimalsQuery, GetNominalValueDecimalsQueryResponse } from "./GetNominalValueDecimalsQuery";
import { GetNominalValueDecimalsQueryHandler } from "./GetNominalValueDecimalsQueryHandler";
import { GetNominalValueDecimalsQueryFixture } from "@test/fixtures/nominalValue/NominalValueFixture";
import { GetNominalValueDecimalsQueryError } from "./error/GetNominalValueDecimalsQueryError";

describe("GetNominalValueDecimalsQueryHandler", () => {
  let handler: GetNominalValueDecimalsQueryHandler;
  let query: GetNominalValueDecimalsQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetNominalValueDecimalsQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetNominalValueDecimalsQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetNominalValueDecimalsQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetNominalValueDecimalsQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying nominal value decimals: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get nominal value decimals", async () => {
      const decimals = 6;

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getNominalValueDecimals.mockResolvedValueOnce(decimals);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetNominalValueDecimalsQueryResponse);
      expect(result.payload).toBe(decimals);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getNominalValueDecimals).toHaveBeenCalledWith(evmAddress);
    });
  });
});
