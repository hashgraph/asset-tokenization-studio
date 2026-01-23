// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetControlListTypeQueryFixture } from "@test/fixtures/controlList/ControlListFixture";
import { GetControlListTypeQuery, GetControlListTypeQueryResponse } from "./GetControlListTypeQuery";
import { GetControlListTypeQueryHandler } from "./GetControlListTypeQueryHandler";
import { GetControlListTypeQueryError } from "./error/GetControlListTypeQueryError";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";

describe("GetControlListTypeQueryHandler", () => {
  let handler: GetControlListTypeQueryHandler;
  let query: GetControlListTypeQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetControlListTypeQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetControlListTypeQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetControlListTypeQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetControlListTypeQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying control list type: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get control list type SecurityControlListType.WHITELIST", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getControlListType.mockResolvedValueOnce(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetControlListTypeQueryResponse);
      expect(result.payload).toStrictEqual(SecurityControlListType.WHITELIST);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getControlListType).toHaveBeenCalledWith(evmAddress);
    });
    it("should successfully get control list type SecurityControlListType.BLACKLIST", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getControlListType.mockResolvedValueOnce(false);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetControlListTypeQueryResponse);
      expect(result.payload).toStrictEqual(SecurityControlListType.BLACKLIST);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getControlListType).toHaveBeenCalledWith(evmAddress);
    });
  });
});
