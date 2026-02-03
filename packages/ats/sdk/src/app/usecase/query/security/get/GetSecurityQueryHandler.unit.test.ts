// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetSecurityQueryHandler } from "./GetSecurityQueryHandler";
import { GetSecurityQuery, GetSecurityQueryResponse } from "./GetSecurityQuery";
import { GetSecurityQueryFixture, SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { GetSecurityQueryError } from "./error/GetSecurityQueryError";
import { Security } from "@domain/context/security/Security";

describe("GetSecurityQueryHandler", () => {
  let handler: GetSecurityQueryHandler;
  let query: GetSecurityQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const security = new Security(SecurityPropsFixture.create());
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetSecurityQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetSecurityQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetSecurityQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetSecurityQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying security: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get security info", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getSecurity.mockResolvedValueOnce(security);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetSecurityQueryResponse);
      expect(result.security).toStrictEqual(security);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getSecurity).toHaveBeenCalledWith(evmAddress);
    });
  });
});
