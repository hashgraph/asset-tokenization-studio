// SPDX-License-Identifier: Apache-2.0
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetMinDateQueryHandler } from "./GetMinDateQueryHandler";
import { GetMinDateQuery, GetMinDateQueryResponse } from "./GetMinDateQuery";
import { GetMinDateQueryError } from "./error/GetMinDateQueryError";

describe("GetMinDateQueryHandler", () => {
  let handler: GetMinDateQueryHandler;
  let query: GetMinDateQuery;
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const minDate = 1234567890;

  beforeEach(() => {
    handler = new GetMinDateQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new GetMinDateQuery("security-123");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetMinDateQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetMinDateQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying min date: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get min date", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getMinDate.mockResolvedValue(minDate);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetMinDateQueryResponse);
      expect(result.minDate).toBe(minDate);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getMinDate).toHaveBeenCalledWith(evmAddress);
    });
  });
});
