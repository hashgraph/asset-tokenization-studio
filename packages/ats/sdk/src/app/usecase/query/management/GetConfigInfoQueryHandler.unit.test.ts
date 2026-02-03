// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetConfigInfoQueryHandler } from "./GetConfigInfoQueryHandler";
import { GetConfigInfoQuery, GetConfigInfoQueryResponse } from "./GetConfigInfoQuery";
import { GetConfigInfoQueryError } from "./error/GetConfigInfoQueryError";
import ContractService from "@service/contract/ContractService";
import { DiamondConfiguration } from "@domain/context/security/DiamondConfiguration";
import { GetConfigInfoQueryFixture } from "@test/fixtures/equity/EquityFixture";

describe("GetConfigInfoQueryHandler", () => {
  let handler: GetConfigInfoQueryHandler;
  let query: GetConfigInfoQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const resolverAddress = new EvmAddress(EvmAddressPropsFixture.create().value).toString();

  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetConfigInfoQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetConfigInfoQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetConfigInfoQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetConfigInfoQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying config info: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get config info", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getConfigInfo.mockResolvedValue([resolverAddress, "1", 1]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetConfigInfoQueryResponse);
      expect(result.payload).toStrictEqual(new DiamondConfiguration(resolverAddress, "1", 1));
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getConfigInfo).toHaveBeenCalledWith(evmAddress);
    });
  });
});
