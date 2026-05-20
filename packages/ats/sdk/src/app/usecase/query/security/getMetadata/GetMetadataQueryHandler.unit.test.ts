// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetMetadataQueryHandler } from "./GetMetadataQueryHandler";
import { GetMetadataQuery, GetMetadataQueryResponse } from "./GetMetadataQuery";
import { GetMetadataQueryError } from "./error/GetMetadataQueryError";

describe("GetMetadataQueryHandler", () => {
  let handler: GetMetadataQueryHandler;
  let query: GetMetadataQuery;
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const metadataValue = ["value1", "value2"];

  beforeEach(() => {
    handler = new GetMetadataQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new GetMetadataQuery("security-123", "myKey");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetMetadataQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetMetadataQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying metadata: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get metadata", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getMetadata.mockResolvedValue(metadataValue);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetMetadataQueryResponse);
      expect(result.value).toEqual(metadataValue);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getMetadata).toHaveBeenCalledWith(evmAddress, query.key);
    });
  });
});
