// SPDX-License-Identifier: Apache-2.0

import { ErrorCode } from "@core/error/BaseError";
import { createMock } from "@golevelup/ts-jest";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalSecurityHoldersQueryFixture } from "@test/fixtures/security/SecurityFixture";
import { EvmAddressPropsFixture, ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { GetTotalSecurityHoldersQueryError } from "./error/GetTotalSecurityHoldersQueryError";
import { GetTotalSecurityHoldersQuery, GetTotalSecurityHoldersQueryResponse } from "./GetTotalSecurityHoldersQuery";
import { GetTotalSecurityHoldersQueryHandler } from "./GetTotalSecurityHoldersQueryHandler";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("GetTotalSecurityHoldersQueryHandler", () => {
  let handler: GetTotalSecurityHoldersQueryHandler;
  let query: GetTotalSecurityHoldersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetTotalSecurityHoldersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetTotalSecurityHoldersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetTotalSecurityHoldersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetTotalSecurityHoldersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying total security holders: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get total security", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getTotalSecurityHolders.mockResolvedValue(1);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetTotalSecurityHoldersQueryResponse);
      expect(result.payload).toStrictEqual(1);

      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(queryAdapterServiceMock.getTotalSecurityHolders).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getTotalSecurityHolders).toHaveBeenCalledWith(evmAddress);
    });
  });
});
