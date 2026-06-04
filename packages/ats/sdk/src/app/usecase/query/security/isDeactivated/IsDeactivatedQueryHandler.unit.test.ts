// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsDeactivatedQuery, IsDeactivatedQueryResponse } from "./IsDeactivatedQuery";
import { IsDeactivatedQueryHandler } from "./IsDeactivatedQueryHandler";
import { IsDeactivatedQueryFixture } from "@test/fixtures/deactivation/DeactivateFixture";
import { IsDeactivatedQueryError } from "./error/IsDeactivatedQueryError";

describe("IsDeactivatedQueryHandler", () => {
  let handler: IsDeactivatedQueryHandler;
  let query: IsDeactivatedQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new IsDeactivatedQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = IsDeactivatedQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsDeactivatedQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsDeactivatedQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying deactivation status: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check is deactivated", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.isDeactivated.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsDeactivatedQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.isDeactivated).toHaveBeenCalledWith(evmAddress);
    });
  });
});
