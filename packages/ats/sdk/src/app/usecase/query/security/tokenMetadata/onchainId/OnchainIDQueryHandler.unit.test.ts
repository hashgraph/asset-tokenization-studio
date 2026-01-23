// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { OnchainIDQuery, OnchainIDQueryResponse } from "./OnchainIDQuery";
import { OnchainIDQueryHandler } from "./OnchainIDQueryHandler";
import { OnchainIDQueryError } from "./error/OnchainIDQueryError";
import { OnchainIDQueryFixture } from "@test/fixtures/tokenMetadata/TokenMetadataFixture";

describe("OnchainIDQueryHandler", () => {
  let handler: OnchainIDQueryHandler;
  let query: OnchainIDQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const onchainID = new EvmAddress(EvmAddressPropsFixture.create().value).value;
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new OnchainIDQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = OnchainIDQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws OnchainIDQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(OnchainIDQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying onchainId: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get onchainID", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.onchainID.mockResolvedValueOnce(onchainID);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(OnchainIDQueryResponse);
      expect(result.payload).toBe(onchainID);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.onchainID).toHaveBeenCalledWith(evmAddress);
    });
  });
});
