// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetNominalValueQuery, GetNominalValueQueryResponse } from "./GetNominalValueQuery";
import { GetNominalValueQueryHandler } from "./GetNominalValueQueryHandler";
import { GetNominalValueQueryFixture } from "@test/fixtures/nominalValue/NominalValueFixture";
import { GetNominalValueQueryError } from "./error/GetNominalValueQueryError";

describe("GetNominalValueQueryHandler", () => {
  let handler: GetNominalValueQueryHandler;
  let query: GetNominalValueQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetNominalValueQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetNominalValueQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetNominalValueQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetNominalValueQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying nominal value: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get nominal value", async () => {
      const nominalValue = new BigDecimal("1000");

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getNominalValue.mockResolvedValueOnce(nominalValue);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetNominalValueQueryResponse);
      expect(result.payload).toBe(nominalValue);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getNominalValue).toHaveBeenCalledWith(evmAddress);
    });
  });
});
