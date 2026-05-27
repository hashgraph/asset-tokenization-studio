// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetCustomDataQueryHandler } from "./GetCustomDataQueryHandler";
import { GetCustomDataQuery, GetCustomDataQueryResponse } from "./GetCustomDataQuery";
import { GetCustomDataQueryError } from "./error/GetCustomDataQueryError";

describe("GetCustomDataQueryHandler", () => {
  let handler: GetCustomDataQueryHandler;
  let query: GetCustomDataQuery;
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const customDataValue = ["value1", "value2"];

  beforeEach(() => {
    handler = new GetCustomDataQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new GetCustomDataQuery("security-123", "myKey");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetCustomDataQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetCustomDataQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying custom data: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get custom data", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getCustomData.mockResolvedValue(customDataValue);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetCustomDataQueryResponse);
      expect(result.value).toEqual(customDataValue);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getCustomData).toHaveBeenCalledWith(evmAddress, query.key);
    });
  });
});
