// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";

import { IsPausedQuery, IsPausedQueryResponse } from "./IsPausedQuery";
import { IsPausedQueryHandler } from "./IsPausedQueryHandler";
import { IsPausedQueryFixture } from "@test/fixtures/pause/PauseFixture";
import { IsPausedQueryError } from "./error/IsPausedQueryError";

describe("IsPausedQueryHandler", () => {
  let handler: IsPausedQueryHandler;
  let query: IsPausedQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new IsPausedQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = IsPausedQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsPausedQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsPausedQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying pause status: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check is paused", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.isPaused.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsPausedQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.isPaused).toHaveBeenCalledWith(evmAddress);
    });
  });
});
