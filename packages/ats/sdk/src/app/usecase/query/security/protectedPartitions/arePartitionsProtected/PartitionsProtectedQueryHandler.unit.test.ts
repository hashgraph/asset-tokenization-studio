// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsOperatorQueryFixture } from "@test/fixtures/erc1400/ERC1400Fixture";
import { PartitionsProtectedQueryHandler } from "./PartitionsProtectedQueryHandler";
import { PartitionsProtectedQuery, PartitionsProtectedQueryResponse } from "./PartitionsProtectedQuery";
import { PartitionsProtectedQueryError } from "./error/PartitionsProtectedQueryError";

describe("PartitionsProtectedQueryHandler", () => {
  let handler: PartitionsProtectedQueryHandler;
  let query: PartitionsProtectedQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new PartitionsProtectedQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = IsOperatorQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws PartitionsProtectedQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(PartitionsProtectedQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying if partitions are protected: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if is operator", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.arePartitionsProtected.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(PartitionsProtectedQueryResponse);
      expect(result.payload).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.arePartitionsProtected).toHaveBeenCalledWith(evmAddress);
    });
  });
});
