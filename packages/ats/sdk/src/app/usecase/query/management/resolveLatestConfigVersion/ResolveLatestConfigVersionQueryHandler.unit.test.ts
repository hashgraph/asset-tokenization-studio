// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ResolveLatestConfigVersionQueryHandler } from "./ResolveLatestConfigVersionQueryHandler";
import {
  ResolveLatestConfigVersionQuery,
  ResolveLatestConfigVersionQueryResponse,
} from "./ResolveLatestConfigVersionQuery";
import { ResolveLatestConfigVersionQueryError } from "./error/ResolveLatestConfigVersionQueryError";

describe("ResolveLatestConfigVersionQueryHandler", () => {
  let handler: ResolveLatestConfigVersionQueryHandler;
  let query: ResolveLatestConfigVersionQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const resolverEvm = new EvmAddress(EvmAddressPropsFixture.create().value);
  const resolverAddress = resolverEvm.toString();
  const configurationId = "0x0000000000000000000000000000000000000000000000000000000000000001";

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new ResolveLatestConfigVersionQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new ResolveLatestConfigVersionQuery(resolverAddress, configurationId);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws ResolveLatestConfigVersionQueryError when the adapter fails", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(resolverEvm);
      queryAdapterServiceMock.getLatestVersionByConfiguration.mockRejectedValueOnce(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(ResolveLatestConfigVersionQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(
          `An error occurred while resolving the latest configuration version: ${errorMsg}`,
        ),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("returns the latest registered configuration version", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(resolverEvm);
      queryAdapterServiceMock.getLatestVersionByConfiguration.mockResolvedValueOnce(7);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(ResolveLatestConfigVersionQueryResponse);
      expect(result.payload).toBe(7);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(resolverAddress);
      expect(queryAdapterServiceMock.getLatestVersionByConfiguration).toHaveBeenCalledWith(
        resolverEvm,
        configurationId,
      );
    });
  });
});
