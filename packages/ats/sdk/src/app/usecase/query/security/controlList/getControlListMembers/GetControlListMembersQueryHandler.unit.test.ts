// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetControlListMembersQueryFixture } from "@test/fixtures/controlList/ControlListFixture";
import { GetControlListMembersQueryError } from "./error/GetControlListMembersQueryError";
import { GetControlListMembersQuery, GetControlListMembersQueryResponse } from "./GetControlListMembersQuery";
import { GetControlListMembersQueryHandler } from "./GetControlListMembersQueryHandler";

describe("GetControlListMembersQueryHandler", () => {
  let handler: GetControlListMembersQueryHandler;
  let query: GetControlListMembersQuery;

  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();

  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const member = new EvmAddress(EvmAddressPropsFixture.create().value).toString();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new GetControlListMembersQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = GetControlListMembersQueryFixture.create();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws GetControlListMembersQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);

      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(GetControlListMembersQueryError);

      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying control list members: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully get control list members", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      queryAdapterServiceMock.getControlListMembers.mockResolvedValueOnce([member]);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetControlListMembersQueryResponse);
      expect(result.payload).toStrictEqual([member]);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(1);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(queryAdapterServiceMock.getControlListMembers).toHaveBeenCalledWith(evmAddress, query.start, query.end);
    });
  });
});
